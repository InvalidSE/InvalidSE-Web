---
title: "QSAT Film Camera"
slug: "qsat"
sortOrder: 5
description: "We put a film camera into a rocket."
tags:
  - "UoA/APSS"
  - "Hardware"
  - "Firmware"
image: "./projects/qsat/launch.png"
link: ""
externalLink: "https://jmw.nz/projects/QSatFilmCamera"
photoAlbum: "https://photos.app.goo.gl/4VSRH3fttHpKH7LG9"
video: ""
github: "https://github.com/questionable-innovations/QSAT_2024-2025"
highlighted: true
readMore: true
collaborators:
  - "Jasper M-W | https://jmw.nz" 
  - "Anton Bennett | https://www.linkedin.com/in/anton-bennett/"
  - "William Yang | https://www.linkedin.com/in/william-yang629/"
  - "Joel Mansor | https://www.linkedin.com/in/joel-mansor-bb7654223/"
---
# We launched a film camera in a rocket in 2025.

With modern electronics, advanced CAD, and the latest 3D printing technology, we managed to capture an entirely white film frame. This is the cool story of how we managed to capture perhaps the most boring photo possible.

:::gallery 2 false
![The resulting film strip - but how did we get here?](./projects/qsat/final-photo.jpg)
:::


## What is PSat?

PSat, or "Pico Satellite", is a summer program run by the Auckland Program for Space Systems at the University of Auckland. The program is designed to give students hands-on experience in building and launching a small pico-satellite payload. The payload can be anything the students like, as long as it's self-contained and fits into the University's Sudden Rush I-class rockets.

At the start of the program, many teams are formed. Those teams are filtered down through design reviews and checkpoints to a final few teams that get their payload launched at the end of the program. The design reviews are loosely based on a simpler version of NASA's mission lifecycle.

Every team also had access to reference designs provided by the APSS team. These reference PCBs were designed to vertically stack and covered the basic functionality needed for a PSat. The reference designs included a battery power supply, an MSP430-based MCU board, and a beacon board with a LoRa radio, GPS, and buzzer.

This year, the teams were given the following theme:

> Create a superlative PSat. Your PSat must be the best at something. It can be the fastest, the most powerful, the most efficient, or the most fun.

## The concept

To fit the theme, we chose "The Most Retro" as our superlative. We decided to build a payload that would take photos upon deployment using a commercial film camera. Alongside the film camera, we wanted to include a small digital camera and a sensor and communication module to send telemetry data back to the ground.

The payload had to fit into an extremely small volume, so we needed a tiny film camera to match. We settled on the Kodak Winner Pocket Camera, a small 110 film camera that was originally tied to the 1988 Olympic Games. The camera is small, light, and dead simple to operate. It has a fixed-focus lens, a fixed aperture, and a fixed shutter speed. The only thing we needed to automate was the shutter release and film advance.

:::gallery 2 true
![The Kodak Winner Pocket Camera we built around](./projects/qsat/winner-camera.jpg)
![Dimensions of the camera, after modelling](./projects/qsat/airspace-layout.png)
:::

## First iteration

Once we had the green light, we split the team in two and started designing the payload from both ends. The mechanical team worked on the payload structure while the electrical team worked on the main motherboard. We also started sourcing the components we would need.

### Electrical

Despite the very analog nature of the film camera, we still needed a full electrical subsystem to act as our flight computer. Not only did it need to detect and trigger the film camera at apogee, we also aimed to dynamically advance the film frame, trigger a digital camera to capture matching shots, and even broadcast flight information over a LoRa radio.

Because of the tight mechanical constraints, we had very limited space for the onboard flight system. Unlike most other teams, we could not simply extend the example PCB designs vertically because that would consume the exact space we needed for the camera itself. To make more space, we instead chose a long motherboard-style layout.

To start, we merged the MCU and beacon example PCBs into a single schematic and began work in Altium. We had a heap of features to integrate.

### Motor control system

Our film camera was designed for humans to operate, not robots. The trigger was simple: a basic push-button mechanism that fired the fixed shutter. The film advance mechanism was far trickier. To advance each frame, you had to slide the flat lever back and forth until it physically locked in place. Sometimes this required a single slide, and other times it needed to be worked back and forth multiple times for a single shot.

That tactile feedback works perfectly for a human who can see and feel the mechanism, but it posed a significant challenge for a robotic system that had to determine the correct position purely through mechanical feedback.

To keep things as simple as possible, we chose a servo for the shutter trigger and a current-sensed motor arrangement for the film advance. The idea was that the motor current would spike when the mechanism stalled, letting us detect the jam states from a single sensor.

We used an SG90 servo for the shutter and modified another to act as a geared-down DC motor for the film advance. To sense current, we designed a small op-amp based measurement circuit. If it failed, we would still have the next iteration to fix it. That turned out to be some excellent foreshadowing.

### Mechanical

The payload had to fit inside the I-class rocket with a maximum payload height of 125 mm and a maximum width of 74 mm. It also needed to leave room for the parachute, eject cleanly at apogee, and open up so we could access the electronics inside. Relative to the total volume available, the film camera was massive.

We used the camera as the core of the payload and designed around it in the remaining space. Two 3D printed shells bolted onto either side of the camera, each holding its own half of the components. On one side we placed the battery and film advance servo, and on the other we housed the long custom PCB with the trigger servo.

Because we maximised the rocket tube's airspace, we had to get creative about attaching the parachute. We did not have enough space for a conventional top or bottom mounting point, so we mounted the parachute through the side of the payload using an internal channel for the strap.

#### Version 0

Version 0 was our initial proof of concept to make sure the film camera could physically fit inside the allocated payload size. We 3D printed a cylinder with the camera's volume cut out of the inside. This gave the whole team a better feel for how much surrounding space we actually had to work with.

#### Version 1

With version 1 we began exploring the size and placement of elements. We knew roughly what components were going into the payload, so we could cut out space for them and test whether the internal structure would still hold with so much material removed. We also started exploring how the payload could open and close while retaining its cylindrical form.

#### Version 2

In version 2, the airspace around the servos was expanded to improve fit, extra space was made at the base for the PSU board, and cutouts were added for both the film camera lens and the ESP32-CAM lens. Even then, the servo spaces were still too tight, and we ended up making temporary scalpel modifications to remove some of the supporting walls.

:::gallery 2 true
![Fit check of the payload integrated with the rocket sections](./projects/qsat/fit-check-1.jpg)
:::

#### Version 3 and beyond

Later mechanical versions mainly focused on increasing internal clearances and adapting to the reality of our electronics. One week before launch day, our custom PCB died, which forced a major scope-down. We rebuilt the internals around a single ESP32-S2 and a collection of smaller modules wired together far more manually than originally planned.

## Third iteration

### The rebuild

By this point we were only four days from launch and no longer had a working controller. This is where our hackathon instincts kicked in.

We split the recovery plan into three sequential scopes:

1. Wait until the payload was ejected into bright sunlight, then push the trigger on the film camera.
2. Add a digital camera and power management so the ESP32-CAM could boot and save as many photos as possible to the SD card.
3. Add remote arming, so we would not accidentally waste our single film shot before launch.

This is why we chose an ESP32 as the core MCU in the first place. It let us communicate over ESP-NOW using the built-in radio, which made it practical to throw together a remote using a Cheap Yellow Display we already had on hand.

When we say rebuild, we mean rebuild. We went back to basics and got the minimum viable version running first. In the end, we managed to get all three priorities working in time.

:::gallery 2 true
![Last-minute bench work during the rebuild](./projects/qsat/launch.png)
![The improvised remote arming controller](./projects/qsat/remote.png)
:::

## Launch day

Launch day was exactly the kind of chaotic payoff we had been working toward. The payload flew, ejected, triggered, and came back down with both the film and digital systems having actually done something useful.

## Recovery

After recovery, we were finally able to inspect the payload and see what had happened in the air. That was the moment of truth for whether the film mechanism had actually survived flight and whether the cameras had captured anything meaningful.

## Photos captured

The digital camera did capture images, and the film camera definitely fired, but the headline result was still gloriously underwhelming: the film frame came back almost entirely white.

That was somehow both disappointing and perfect. After all that design work, electrical drama, last-minute rebuilding, and launch-day tension, we had successfully launched a retro film camera in a rocket and captured perhaps the least informative photo possible.

:::gallery 2 true
![One of the digital images captured in flight](./projects/qsat/onboard-camera-1.jpg)
![The final film scan with the washed-out frame in the middle](./projects/qsat/final-photo.jpg)
:::
