import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type DeviceOrientation = 'horizontal' | 'vertical';

interface DeviceInfo {
  deviceType: DeviceType;
  orientation: DeviceOrientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  aspectRatio: number;
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
}

function getOrientation(width: number, height: number): DeviceOrientation {
  return width >= height ? 'horizontal' : 'vertical';
}

function getDeviceInfo(): DeviceInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const deviceType = getDeviceType(width);
  const orientation = getOrientation(width, height);

  return {
    deviceType,
    orientation,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    screenWidth: width,
    screenHeight: height,
    aspectRatio: width / height,
  };
}

export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo);

  useEffect(() => {
    let timeoutId: number;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setDeviceInfo(getDeviceInfo());
      }, 150);
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        setDeviceInfo(getDeviceInfo());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
}

export function getImageOrientationForDevice(deviceInfo: DeviceInfo): DeviceOrientation {
  if (deviceInfo.isMobile && deviceInfo.orientation === 'vertical') {
    return 'vertical';
  }
  return 'horizontal';
}
