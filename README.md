# GreenTechTeam07

## Team-07
- Alexandra Fietze
- Fynn Hellwig
- Aaron Kreuzer
- Miriam Weigand
    
    
## Challenge: Next Mobility Labs | Vehicle-to-Grid

Renewable energy has a timing problem. Solar peaks at noon and wind blows at night, but demand peaks in the evening when people come home, cook and plug in their cars. Green power gets wasted when there is a surplus, and fossil plants jump in when it runs short.

The fix is already parked in every company car park. Electric vehicles are mobile batteries, and they sit unused for an average of 22 hours a day. Vehicle-to-Grid turns them into part of the solution: instead of only consuming energy, they store it when it is green and cheap and feed it back when the grid needs it most.

The commercial platform that connects fleet operators to the energy system is still white space. How might we build it?

## Our product
A platform that gives advice on when to charge and when to feed power back into the grid, allowing fleet managers to generate profit while EV are plugged in at the company base. Grid Operators can access on a local and relyable source of energy in case of emergency.

## Motivation to participate 
Fleet owners:
- cheap charging (planned) and expensive selling (e.g. FCR availability and mFRR participation) -> profit margin -> *financial gain* 
- altruistic purpose (backup support for critical infrastructure such as hospitals) -> *positive media reaction*

Grid operator:
- access to cheaper energy compared to fossil-fuel-based generation during periods of high demand and low renewable supply -> *finacial gain*
- renewable energy integration -> power supply with reduced fossil fuel dependence-> *environmental friendliness*
- local energy supply -> *lower transmission losses and reduced network costs*
- in case of local shortages the EV fleets store enough energy as a backup support for critical infrastructure -> *power security*


## Things we considered and Guide lines:
- Fleet movement behavior: EVs have to remain usable at predictable times -> sufficient battery capacity must remain available for estimated driving ranges -> cannot feed all energy into the grid overnight if EVs need to be ready the next day
- try to buy power at cheap times (around midday) and sell during peaks (usually around 6–8 PM). If EVs are unavailable during critical times on weekdays, still optimise for maximum financial return
- be considerate of battery life -> include temperature effects and avoid full charge/discharge cycles
- assumption: charging infrastructure ensures that each car is plugged in while stationed
    
## Target Group
Start with companies that already have large EV fleets and are planning to expand them in the coming years. EVs should be stationed on company property.

Examples:
- CocaCola (1.600 EVs (2025), https://www.elektroauto-news.net/news/coca-cola-deutschland-rein-elektrisch)
- Telekom (4.500 EVs (2025))

## Contact attempts
- Albert Hold - Telekom employee for EV fleet
- Patrick Eberwein - Managing Director Comfort Charge Telekom
- Dr Mark Jacquemin - Mainova Head of Logistics and Mobility
- David Reichmann - Vehicle Operation at Enterprise Mobility
- Dr. Franz Weinberger - CFO Sixt SE

## What we would like to know from potential costumers
- What is the composition of their fleet? How much total battery capacity do they have? Are there subgroups such as small cars for business trips, reserve cars, or larger delivery vans?
- What is the fleet/subgroup behaviour? During which timeslots are the cars being used? How far do they drive on average? How much battery capacity has to remain available before usage? During which time windows would the EVs be available for V2G?
- What does the charging infrastructure look like? Can all EVs be plugged in simultaneously? Do you use fast charging? How long does charging take?
- When are you planning to replace vehicles in the fleet? In 3, 5, or 10 years?
- Do the batteries belong to the company or are they leased?

## The development of the charging infrastructure
- ISO 15118-20 will be introduced in January 2027. It is the international standard defining advanced network and application layer requirements for Vehicle-to-Grid  (V2G) communication.
- This rollout will gradually make both EV fleets and charging infrastructure compatible with V2G.
- Currently, most members of our target group lack sufficient charging ports. However, the costs for additional infrastructure are expected to amortize over time.
- Until then, methods such as Load Balancing, Power Sharing, and Smart Charging can help optimise existing infrastructure.

## Battery degradation - How much effect has V2G?
Generally:
-  LFP batteries allow approximately 3,000–10,000 Full Equivalent Cycles (FEC)

Assume:
- 100km driving range per car per weekday -> 25.000km/year
- average consumption: 17kWH/100km
- yeary energy usage: 4.250kEh/year 
- LFP batteries with 50kWh capacity
- moderate temperatures (~20°C)

Consider two V2G modes:

1. Moderate V2G:
- stay within 20%-80% State of Charge (SoC) window
- limit additional V2G power transfer to 0.5 FEC per day

2. Harder V2G:
- stay within 10%-90% State of Charge (SoC) window
- limit additional V2G power transfer to 0.75 FEC per day

|                          | no V2G             | moderate V2G   |  harder V2G   |
|------------------|-------------------|--------------------|-----------------|
|FPC per year    | 140                     | 230                     |                  273|
|residual battery cap. after 5 year| 94%|90%|85%|
|residual battery cap. after 10 year| 88%| 82%| 74%|

-> V2G is not expected to degrade battery capacity by more than approximately 10% over a 10-year period under moderate operation

-> considering the typical fleet replacement cycle, battery replacement may not necessarily be required

##  Our Prototype Website
- can be found in "launch-v2g" folder, needs to be hosted locally

## Things about to come onto the website:
- tool for submitting fleet behaviour data
- consideration of temperature effects on charging efficiency, charging speed, and battery degradation
