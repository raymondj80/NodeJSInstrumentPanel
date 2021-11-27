import sys
from time import sleep
import states
import json
import vxi11

#SR860 Lockin imports
#from pymeasure.adapters import VXI11Adapter, adapter
#from pymeasure.instruments.srs import SR860
#from pymeasure.instruments.keithley import Keithley6221
TCPIP1 = '140.247.189.23'
TCPIP2 = '140.247.189.96'
# LI1 = vxi11.Instrument("140.247.189.23")
# LI2 = vxi11.Instrument("140.247.189.96")

# for inst in [LI1, LI2]:
#     print(inst.ask("*IDN?"))
#     print("Internal frequency: ", inst.ask("OUTP? 15"))
#     inst.close()
#     print("Connection closed.")

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
        #self._server_address = (SERVER, PORT)
    
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
                print('Client Error.  Check if MultiVu is running. \n')
                #instrumentInfo.parseInput(['-h'])
        else:
            raise Exception('This must be running on a Windows machine')

    def get_data(self):
        arg0 = win32com.client.VARIANT(pythoncom.VT_BYREF | pythoncom.VT_R8, 0.0)
        arg1 = win32com.client.VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)
        arg2 = win32com.client.VARIANT(pythoncom.VT_BYREF | pythoncom.VT_R8, 0.0)
        arg3 = win32com.client.VARIANT(pythoncom.VT_BYREF | pythoncom.VT_I4, 0)
        err0 = self._mvu.GetTemperature(arg0, arg1)
        err1 = self._mvu.GetField(arg2, arg3)
        # win32com reverses the arguments, so:
        return json.dumps({
            "temp": arg0.value, 
            "temp_state": states.temperatureStates[str(arg1.value)],
            "field": arg2.value,
            "field_state": states.fieldStates[str(arg3.value)]
            })

class SR860(vxi11.Instrument):
    def __init__(self, ipaddr):
        super().__init__(ipaddr)

    @property
    def vx(self):
        return self.ask("OUTP? 0")

    @property
    def vy(self):
        return self.ask("OUTP? 1")

    @property
    def theta(self):
        return self.ask("OUTP? 3")

    @property
    def frequency(self):
        return self.ask("FREQ?")

LI1 = SR860("140.247.189.23")
LI2 = SR860("140.247.189.96")

try:
    LI1 = SR860(TCPIP1)
    lockin_json1 = {
        "Vx1": LI1.vx,
        "Vy1": LI1.vy,
        "freq1": LI1.frequency,
        "theta1": LI1.theta
    }
    LI1.close()

except:
    lockin_json1 = {
        "Vx1": None,
        "Vy1": None,
        "freq1": None,
        "theta1": None
    }

try:
    LI2 = SR860(TCPIP2)
    lockin_json2 = {
        "Vx2": LI2.vx,
        "Vy2": LI2.vy,
        "freq2": LI2.frequency,
        "theta2": LI2.theta
    }
    LI2.close()

except:
    lockin_json2 = {
        "Vx2": None,
        "Vy2": None,
        "freq2": None,
        "theta2": None
    }

my_QD = QDInstrument('DYNACOOL')
myjson = json.loads(my_QD.get_data())
myjson.update(lockin_json1)
myjson.update(lockin_json2)
print(json.dumps(myjson))












