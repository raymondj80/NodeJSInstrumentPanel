import sys
from time import sleep
import states
import json
import vxi11

# def parse_inputs(seq):
#     cmds = []
#     with open(seq) as f:
#         lines = f.readlines()
#         for line in lines:
#             cmds.append(line.split(' '))
#     return cmds

# def parse_commands(cmds):
#     pass

if sys.platform == 'win32':
    try:
        import win32com.client
        import pythoncom
        # print("Successfully imported modules")
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
                instrumentInfo = inputs()
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
            self.state = (t,f,ts,fs)
            # print(t,f,ts,fs,check_temp, check_field)
            sleep(1)
        
        sleep(duration)

class Commands(QDInstrument):
    def __init__(self, instrument_type):
        super().__init__(instrument_type)
        self.cmds = []
        self.state = []
        self.query = ''

    def parse_sequence(self, seq_file):
        with open(seq_file) as f:
            lines = f.readlines()
            for line in lines:
                # line[-1].strip()
                self.cmds.append(line.split(' '))
        print(self.cmds)

    def run_sequence(self):
        for cmd in self.cmds:
            print(cmd)
            if cmd[1] == "TEMP":
                self.set_temperature(float(cmd[2]), float(cmd[3]), int(cmd[4]))

            elif cmd[1] == "FIELD":
                self.set_field(float(cmd[2]), float(cmd[3]), 0, 0)
            
            elif cmd[1] == "WAITFOR":
                self.wait_for(float(cmd[2]), int(cmd[3]), int(cmd[4]))

if __name__ == "__main__":
    myScript = Commands("DYNACOOL")
    myScript.parse_sequence('../seq/211122_multivu_seq_waitField.seq')
    myScript.run_sequence()

