## Dictionary for states of PPMS (temperature, field, chamber)

temperatureStates = {
            "1": "Stable",
            "2": "Tracking",
            "5": "Near",
            "6": "Chasing",
            "7": "Pot Operation",
            "10": "Standby",
            "13": "Diagnostic",
            "14": "Impedance Control Error",
            "15": "General Failure",
        }

fieldStates = {
            "1": "Stable",
            "2": "Switch Warming",
            "3": "Switch Cooling",
            "4": "Holding (Driven)",
            "5": "Iterate",
            "6": "Ramping",
            "7": "Ramping",
            "8": "Resetting",
            "9": "Current Error",
            "10": "Switch Error",
            "11": "Quenching",
            "12": "Charging Error",
            "14": "PSU Error",
            "15": "General Failure",
        }

chamberStates = {
            "0": "Sealed",
            "1": "Purged and Sealed",
            "2": "Vented and Sealed",
            "3": "Sealed",
            "4": "Performing Purge/Seal",
            "5": "Performing Vent/Seal",
            "6": "Pre-HiVac",
            "7": "HiVac",
            "8": "Pumping Coninuously",
            "9": "Flooding Continuously",
            "14": "HiVac Error",
            "15": "General Failure",
        }