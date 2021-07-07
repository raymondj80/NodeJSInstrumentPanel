import sys
from time import sleep
import states
import json

#SR860 Lockin imports
from pymeasure.adapters import VXI11Adapter
from pymeasure.instruments.srs import SR860
from pymeasure.instruments.keithley import Keithley6221


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

adapter1 = VXI11Adapter("TCPIP::140.247.189.23::inst0::INSTR")
adapter2 = VXI11Adapter("TCPIP::140.247.189.96::inst0::INSTR")

#code for keithley current source, ready to test whenever! -SD, 7/2/21
#adapter_keithley = VXI11Adapter("TCPIP::140.247.189.102::inst0::INSTR")
#keithley1 = Keithley6221(adapter_keithley)

my_QD = QDInstrument('DYNACOOL')

#Ugly fix; add instrument selection functionality later
try:
    LI1 = SR860(adapter1)
    lockin_json1 = {
        "Vx1": LI1.x,
        "Vy1": LI1.y,
        "freq1": LI1.frequency,
        "theta1": LI1.theta
    }
except:
    lockin_json1 = {
        "Vx1": None,
        "Vy1": None,
        "freq1": None,
        "theta1": None
    }

try:
    LI2 = SR860(adapter2)
    lockin_json2 = {
        "Vx2": LI2.x,
        "Vy2": LI2.y,
        "freq2": LI2.frequency,
        "theta2": LI2.theta
    }
except:
    lockin_json2 = {
        "Vx2": None,
        "Vy2": None,
        "freq2": None,
        "theta2": None
    }

myjson = json.loads(my_QD.get_data())
myjson.update(lockin_json1)
myjson.update(lockin_json2)
print(json.dumps(myjson))