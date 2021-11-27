import sys


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
      
