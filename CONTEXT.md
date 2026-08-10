# Green Flags

Helps beach-goers on the Bulgarian Black Sea coast see the predicted water-safety flag for each
beach before they go, and report what they actually saw once there.

## Language

**Area**:
One of the 13 coastal municipalities (общини) the Bulgarian coast is divided into, north to south
from the Romanian to the Turkish border (Shabla, Kavarna, Balchik, Varna, Avren, Dolni Chiflik,
Byala, Nessebar, Pomorie, Burgas, Sozopol, Primorsko, Tsarevo). Every beach sits in exactly one
Area; many beaches share an Area.
_Avoid_: Municipality, region, община (used only for the underlying government data source)

**Selected Area**:
The Area (or "All Areas") the beach list is currently filtered to; search and flag-color filtering
both apply *within* it. Starts as the Detected Area, falling back to "All Areas".
_Avoid_: Current area, active filter

**Detected Area**:
The Area of the visitor's nearest beach, from their browser location, if that beach is within
50 km — used only as Selected Area's starting point, never persisted or recomputed after load.
_Avoid_: User's area, current location, geolocated area

**All Areas**:
The no-filter state of Selected Area — every beach is shown regardless of Area.
_Avoid_: No area, unfiltered

**Distance**:
The straight-line distance from the visitor's browser location to a beach, shown on that beach's
card whenever the location is known — independent of the Detected Area's 50 km cutoff.
_Avoid_: Distance away, proximity
