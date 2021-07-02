import sys
from time import sleep
import states
import json

#SR860 Lockin imports
from pymeasure.adapters import VXI11Adapter
from pymeasure.instruments.srs import SR860

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

adapter = VXI11Adapter("TCPIP::140.247.189.96::inst0::INSTR")

my_QD = QDInstrument('DYNACOOL')

#Ugly fix; add instrument selection functionality later
try:
    LI1 = SR860(adapter)
    lockin_json = {
        "Vx": LI1.x,
        "Vy": LI1.y,
        "freq": LI1.frequency,
        "theta": LI1.theta
    }
except:
    lockin_json = {
        "Vx": None,
        "Vy": None,
        "freq": None,
        "theta": None
    }

myjson = json.loads(my_QD.get_data())
myjson.update(lockin_json)
print(json.dumps(myjson))