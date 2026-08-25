'use client';

import React from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import {
  Zap,
  Bell,
  Key,
  Navigation,
  ShoppingBag,
  MapPin,
  CheckCircle2,
  Star,
  Sparkles,
} from 'lucide-react';
import { DriverJourney } from './DriverJourney';
import {
  Clouds,
  Birds,
  Trees,
  Buildings,
  Restaurants,
  Minimarket,
  Hospital,
  GasStation,
  StreetLights,
  TrafficSigns,
  Road,
} from './environment/EnvironmentObjects';

export const CINEMATIC_STORY_MILESTONES = [
  { id: 'waiting', step: 1, title: 'Driver Waiting', subtitle: 'Standby at Kalirejo Hub', icon: Zap, color: 'bg-emerald-500' },
  { id: 'order_received', step: 2, title: 'Order Received', subtitle: 'Notifikasi Orderan Masuk', icon: Bell, color: 'bg-primary' },
  { id: 'starts', step: 3, title: 'Driver Starts', subtitle: 'Stang & Mesin Ignition On', icon: Key, color: 'bg-amber-500' },
  { id: 'driving', step: 4, title: 'Driving', subtitle: 'Meluncur di Jalan Kalirejo', icon: Navigation, color: 'bg-blue-500' },
  { id: 'pickup', step: 5, title: 'Pickup', subtitle: 'Belanja / Paket Diambil', icon: ShoppingBag, color: 'bg-indigo-500' },
  { id: 'delivery', step: 6, title: 'Delivery', subtitle: 'Pengantaran Tepat Waktu', icon: MapPin, color: 'bg-purple-500' },
  { id: 'completed', step: 7, title: 'Completed', subtitle: 'Diterima & Bintang 5', icon: CheckCircle2, color: 'bg-emerald-500' },
];

export function CinematicStoryExperience() {
  const { scrollYProgress } = useScroll();

  // Smooth physics spring for 60 FPS scroll storytelling
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001,
  });

  // Parallax Layer Transforms
  const skyCloudX = useTransform(smoothScroll, [0, 1], [0, -300]);
  const farBuildingsX = useTransform(smoothScroll, [0, 1], [0, -600]);
  const midTreesX = useTransform(smoothScroll, [0, 1], [0, -900]);
  const nearLightsX = useTransform(smoothScroll, [0, 1], [0, -1300]);
  const driverTrackX = useTransform(smoothScroll, [0, 1], ['0%', '15%']);

  // Active Story Milestone Index (0 to 6 based on scroll progress)
  const milestoneIndex = useTransform(smoothScroll, [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1], [0, 1, 2, 3, 4, 5, 6]);

  return (
    <div className="relative w-full overflow-hidden pointer-events-none select-none transform-gpu py-8">
      {/* Background Parallax Sky & Clouds */}
      <motion.div style={{ x: skyCloudX }} className="absolute inset-x-0 top-0 z-0">
        <Clouds className="opacity-80" />
        <Birds className="ml-32 -mt-10 opacity-70" />
      </motion.div>

      {/* Far Background Parallax Buildings & Places */}
      <motion.div style={{ x: farBuildingsX }} className="flex items-end justify-between px-12 z-10 relative opacity-40">
        <Buildings />
        <Restaurants />
        <Minimarket />
        <Hospital />
        <GasStation />
      </motion.div>

      {/* Midground Parallax Trees & Traffic Signs */}
      <motion.div style={{ x: midTreesX }} className="flex items-end justify-between px-6 z-15 relative mt-2 opacity-70">
        <Trees />
        <TrafficSigns />
        <Trees />
      </motion.div>

      {/* Main Mascot Driver & Road Parallax Container */}
      <div className="relative z-20 my-4 max-w-xl mx-auto">
        <motion.div style={{ x: driverTrackX }}>
          <DriverJourney speed={1.2} />
        </motion.div>

        {/* Foreground Streetlights & Road Markings Parallax */}
        <motion.div style={{ x: nearLightsX }} className="flex items-center justify-between z-30 relative -mt-4 opacity-90">
          <StreetLights />
          <StreetLights />
        </motion.div>

        <Road className="mt-1 shadow-2xl rounded-2xl overflow-hidden" />
      </div>
    </div>
  );
}
