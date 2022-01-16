import socket
import sys
from time import sleep
import datetime

from states import temperatureStates, fieldStates, chamberStates
from server_params import _HOST, _PORT

class remoteQDInstrument:
    def __init__(self, instrument_type, host=_HOST, port=_PORT):
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
        self._host = host
        self._port = port
        self._server_address = (self._host,self._port)
    
    def connect_socket(self, setblocking=False):
        # Create a TCP/IP socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock=sock
        self.sock.connect((self._host,self._port))
        print(sys.stderr, 'connecting to %s port %s' %(self._server_address))
        
        sleep(1)
        self.sock.setblocking(setblocking)
        self._remote_address = self.sock.getsockname()

    def send_message(self, message):
        self.sock.sendall(bytes(message, "utf-8"))
        sleep(0.8)
        response = self.sock.recv(1024).decode('utf-8')
        sleep(0.8)
        return response
        
    def set_temperature(self, temperature=100, rate=10, mode=0, wait=True, delay=1):
        message='set_temperature(temperature={0}, rate={1}, mode={2})'.format(temperature, rate, mode)
        response = self.send_message(message)
        start = datetime.datetime.now()
        while wait:
            if (self.temperature_status(verbose=True) == 'Stable' and
                (datetime.datetime.now() - start > datetime.timedelta(seconds=10))):
                break
            sleep(delay)        
        return response

    def _reset_temperature(self):
        message='set_temperature(temperature={0}, rate={1}, mode={2})'.format(300, 10, 0)
        response = self.send_message(message)
        return response
    
    
    def set_field(self, field=500, rate=200, approach=0, mode=0, wait=True, delay=1):
        message='set_field(field={0}, rate={1}, approach={2}, mode={3})'.format(field, rate, approach, mode)
        response = self.send_message(message)
        start = datetime.datetime.now()
        while wait:
            if (self.field_status(verbose=True) == 'Holding (Driven)' and
                (datetime.datetime.now() - start > datetime.timedelta(seconds=10))):
                break
            sleep(delay)        
        return response        

    def _reset_field(self):
        message='set_field(field={0}, rate={1}, approach={2}, mode={3})'.format(0, 200, 0, 0)
        response = self.send_message(message)
        return response
     
    def set_position(self, position=0, speed=10):
        message='set_position(position={0}, speed={1})'.format(position, speed)
        response = self.send_message(message)
        return response    
    
    def _reset_position(self):
        message='set_position(position={0}, speed={1})'.format(0, 2)
        response = self.send_message(message)
        return response    
    
    @property
    def temperature(self):
        message='temperature'
        response = self.send_message(message)
        return response
    
    @property
    def field(self):
        message='field'
        response = self.send_message(message)
        return response
    
    @property
    def position(self):
        message='position'
        response = self.send_message(message)
        return response
    
    def temperature_status(self, verbose=True):
        message='temperature_status'
        response = self.send_message(message)
        return temperatureStates[response] if verbose else response
    
    def field_status(self, verbose=True):
        message='field_status'
        response = self.send_message(message)
        return fieldStates[response] if verbose else response
    
    def position_status(self):
        message='position_status'
        response = self.send_message(message)
        return response

    def close_socket(self):
        message='CLOSE'
        response = self.send_message(message)
        return response
    
    def exit_server(self):
        message='EXIT'
        response = self.send_message(message)
        return response
    