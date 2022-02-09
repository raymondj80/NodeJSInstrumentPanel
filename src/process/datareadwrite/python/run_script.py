import sys
from time import sleep
import json

if sys.platform == 'win32':
    try:
        import win32com.client
        import pythoncom
    except ImportError:
        print("Must import the pywin32 module.  Use:  ")
        print(f"\tconda install -c anaconda pywin32")
        print("   or")
        print(f"\tpip install pywin32")
        exit()

class QDInstrument:
    def __init__(self, instrument_type):
        instrument_type = instrument_type.upper()

        if instrument_type == 'DYNACOOL':
            self._class_id = 'QD.MULTIVU.DYNACOOL.1'
        elif instrument_type == 'PPMS':
            self._class_id = 'QD.MULTIVU.PPMS.1'
        elif instrument_type == 'VERSALAB':
            self._class_id = 'QD.MULTIVU.VERSALAB.1'
        elif instrument_type == 'MPMS3':
            self._class_id = 'QD.MULTIVU.MPMS3.1'
        elif instrument_type == 'OPTICOOL':
            self._class_id = 'QD.MULTIVU.OPTICOOL.1'
        else:
            raise Exception('Unrecognized instrument type: {0}.'.format(instrument_type))
        
        if sys.platform == 'win32':
            try: 
                self._mvu = win32com.client.Dispatch(self._class_id)
            except:
                print('Client Error. Check if MultiVu is running. \n')
        else:
            raise Exception('This must be running on a Windows machine')

    def get_temperature(self):
        arg0 = win32com.client.VARIANT(pythoncom.VT_BYREF | pythoncom.VT_R8, 0.0)
        arg1 = win32com.client.VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)
        self._mvu.GetTemperature(arg0, arg1)
        return (arg0.value, arg1.value)

    def get_field(self):
        arg0 = win32com.client.VARIANT(pythoncom.VT_BYREF | pythoncom.VT_R8, 0.0)
        arg1 = win32com.client.VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)
        self._mvu.GetField(arg0, arg1)
        return (arg0.value, arg1.value)
        
    def set_temperature(self, temperature, rate, mode=0):
        """Sets temperature and returns MultiVu error code"""
        err = self._mvu.SetTemperature(temperature, rate, mode)

    def set_field(self, field, rate=100, approach=0, mode=0):
        """Sets field and returns MultiVu error code"""
        err = self._mvu.SetField(field, rate, approach, mode)

    def wait_for(self, duration:float, check_temp:int, check_field:int):
        ts = fs = -1
        while ((check_temp == 1 and ts != 1) or (check_field == 1 and (fs != 1 and fs != 4))):
            t, ts = self.get_temperature()
            f, fs = self.get_field()
            sleep(1)
        sleep(duration)

class Commands(QDInstrument):
    def __init__(self, instrument_type):
        super().__init__(instrument_type)
        self.cmds = []
        self.state = {'num': -1, 'record': False, 'file': None, 'cmd': None}

    def parse_sequence(self, seq):
        cmds = seq.split("\n")
        for cmd in cmds:
            self.cmds.append(cmd.split(" "))
        # print(self.cmds)

    def run_sequence(self):
        for i,cmd in enumerate(self.cmds):

            self.state["num"] = i
            
            # Start record
            if cmd[1] == "START":
                self.state["record"] = True
                self.state["cmd"] = "Rec"
                self.state["file"] = cmd[2]

            # Stop record
            elif cmd[1] == "STOP":
                self.state["record"] = False
                self.state["cmd"] = "StopRec"
                self.state["file"] = None

            print(json.dumps(self.state))

            # Set temperature
            if cmd[1] == "TEMP":
                self.state["cmd"] = "Temp"
                self.set_temperature(float(cmd[2]), float(cmd[3]), int(cmd[4]))

            # Set field
            elif cmd[1] == "FIELD":
                self.state["cmd"] = "Field"
                self.set_field(float(cmd[2]), float(cmd[3]), 0, 0)
            
            # Wait for @params(time, check_temp, check_field)
            elif cmd[1] == "WAITFOR":
                self.state["cmd"] = "Wait"
                self.wait_for(float(cmd[2]), int(cmd[3]), int(cmd[4]))

            sleep(0.1)
            
if __name__ == "__main__":
    myScript = Commands("DYNACOOL")
    myScript.parse_sequence(sys.argv[1])
    myScript.run_sequence()

    #run_script end
    sleep(1)
    myScript.state["num"] = -1
    print(json.dumps(myScript.state))