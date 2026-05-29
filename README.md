# GreenTechTeam07

## Next Mobility Labs | Vehicle-to-Grid

Renewable energy has a timing problem. Solar peaks at noon and wind blows at night, but demand peaks in the evening when people come home, cook and plug in their cars. Green power gets wasted when there is a surplus, and fossil plants jump in when it runs short.

The fix is already parked in every company car park. Electric vehicles are mobile batteries, and they sit unused for an average of 22 hours a day. Vehicle-to-Grid turns them into part of the solution: instead of only consuming energy, they store it when it is green and cheap and feed it back when the grid needs it most.

The commercial platform that connects fleet operators to the energy system is still white space. How might we build it?

## Our product
A plattform that gives advises on when to charge and when feed power into the grid, so that fleet managers can gain money, whilst standing plugged in at the company base.

## Motivation to participate 
Fleet owners:
- cheap charging (planned) and expensive selling (day-to-day FCR availability and mFRR) -> profit margin -> *financial gain*
- altruistic purpose (Sicherheitsnetz: systemrelevante nutzer, hospital) -> *positive media reaction*
Grid operator:
- offer of cheaper energy than energy from fossil fuels in time of high demand and low supply of cheap renewable energy -> *finacial gain*
- renewable energy -> power supply without fossil fuel relyence -> *environmental friendlyness*
- local supply -> *lower transmission losses and network costs*


## Things we considered and Guide lines:
- Fleet moving behaviour: EVs have to be usable at predictable times -> need sufficient battery left for driving the estimated ranges -> can't feed everything into grid overnight if EV needs to be ready to use at the next day 
- try to buy power at cheep times (around midday), sell at peaks (usually around 6-8PM). If EVs are not around those critical time during week days, still optimise for max money output 
- be conciderative of batterylife -> include temperature, never fully charge/discharge
    
## Target Group
Start with companies, that have have large EV fleets and are planning to extend them in the next years. 
Examples:
  CocaCola (1.600 Evs (2025), https://www.elektroauto-news.net/news/coca-cola-deutschland-rein-elektrisch)
  Telekom (4.500 Evs (2025)). 
EVs should be stationed on company property.

## Contact attemps


## What we would like to know from potential costumers
- What is the composition of their fleet. How much total battery capazity do they have? Are the subgroups e.g. small cars for buisness trips, reserve cars or larger vans for delivery?
- What is the fleets /subgroups bahaviour? In what timeslots are the cars being used? How far do they drive on averge? How much battery capazity has to be left when car starts to be used? In what time windows would the EVs be available for V2G?
- How does the charging infrastructur look like? Can all EVs be pluged in simultaniously? Do you use fast charge? How long does charging take?
- On what time are you planning to replace the cars in the fleet anyway? In 3,5 or 10 years?
- Do the batterys belong to the company or are the leased?

## Assumtions 
- charging infrastructure yield each car is plugged in when on station
- for the following calculations we assume: fleetsize 2.000 EV, 50kWh Battery each, driving usage 

## The development of the charging infrastrucute
- ISO 15118-20 is being introduced January 2027, the international standard defining the advanced network and application layer requirements for Vehicle-to-Grid (V2G) communication. 
- This rollout leads to both EV fleets and the needed charger infrastructure compatible with V2G.
- Currently most members of our target group lack charging ports. The cost for new ones however will be amortized over time. Until then methods like Load Balancing, Power Sharing and Smart Charging can make use.

## Battery degredation
Generally:
-  LFPs allow 3.000-10.000 Full Equivalent Cycles (FEC)

Assume:
- 100km driving range per car per weekday -> 25.000km/year
- average consumption: 17kWH/100km
- -> occupancy: 4.250kEh/year 
- LFP batteries with 50kWh 
- moderate temperatures ~20°

Consider two V2G modes:

1. moderate V2G:
     - stay within 20%-80% State of Charge (SoC) window
- limit power transfer additional 0.5 FEC due to V2G per day

2. harder V2G:
- stay within 10%-90% State of Charge (SoC) window
- limit power transfer additional 0.75 FEC due to V2G per day

|                          | no V2G             | moderate V2G   |  harder V2G   |
|------------------|-------------------|--------------------|-----------------|
|FPC per year    | 140                     | 230                     |                  273|
|residual battery cap. after 5 year| 94%|90%|85%|
|residual battery cap. after 10 year| 88%| 82%| 74%|

-> V2G is not exspected tp degredate battery more then 10% on a 10 year scale
-> concidering the timescale of replacing the fleats with new cars, battery exchange no nessecarly

##  Our Prototype Website
- can be found in "launch-v2g" folder, needs to be hosted locally

## Thinks about to come onto the website:
- Tool to hand in fleet behaviour
- Concider temperature effects on charging efficiency/time battery
