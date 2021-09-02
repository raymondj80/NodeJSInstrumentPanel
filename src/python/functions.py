import sys
import RemoteQDInstrument

from RemoteQDInstrument import remoteQDInstrument
from server_params import _HOST, _PORT


rQD = remoteQDInstrument(instrument_type="DYNACOOL",host=_HOST, port=_PORT)

### make sure that server is created before doing this
rQD.connect_socket()

# Orders = sys.argv[1]

# for order in Orders:
#     pass
