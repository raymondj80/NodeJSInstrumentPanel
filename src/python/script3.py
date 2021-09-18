  
# from script2 import my_QD
import sys
import json

from pymeasure.instruments import instrument
modeDict = {
    'Linear': 0,
    'No Overshoot': 1,
    'Oscillate': 2
}
# # Orders = json.loads(sys.argv[1])
# for i in range(1,int(sys.argv[-1])):
#     order, value, rate, mode = sys.argv[i].split(',')
#     print(mode)
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

    def set_temperature(self, temperature, rate, mode=0):
        """Sets temperature and returns MultiVu error code"""
        err = self._mvu.SetTemperature(temperature = temperature, rate = rate, mode = mode, wait = True)

    def set_field(self, field, rate=100, approach=0, mode=0):
        """Sets field and returns MultiVu error code"""
        err = self._mvu.SetField(field, rate, approach, mode)
      

my_QD = QDInstrument('DYNACOOL')
for i in range(1,int(sys.argv[-1])):
    order, value, rate, mode = sys.argv[i].split(',')
    if order == 'Ramp_to_temp':
        my_QD.set_temperature(temperature = value, rate = rate, mode = modeDict[mode])
    elif order == 'Ramp_to_mag':
<<<<<<< HEAD
<<<<<<< HEAD
        my_QD.set_field(value, rate, modeDict[mode], 0)
=======
=======
>>>>>>> da8b409438dd6a2cc3d985a4d68019b14c028b4c
        my_QD.set_field(field = value, rate = rate, mode = modeDict[mode])

    
>>>>>>> da8b409438dd6a2cc3d985a4d68019b14c028b4c
