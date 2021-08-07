import sys
from time import sleep
import states
import json
import vxi11

#SR860 Lockin imports
#from pymeasure.adapters import VXI11Adapter, adapter
#from pymeasure.instruments.srs import SR860
#from pymeasure.instruments.keithley import Keithley6221

# LI1 = vxi11.Instrument("140.247.189.23")
# LI2 = vxi11.Instrument("140.247.189.96")

# for inst in [LI1, LI2]:
#     print(inst.ask("*IDN?"))
#     print("Internal frequency: ", inst.ask("OUTP? 15"))
#     inst.close()
#     print("Connection closed.")

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

print(LI1.vy)
LI1.close()