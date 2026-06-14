import * as Location from 'expo-location';

/**
 * Thin wrapper around expo-location for foreground GPS.
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

/** Requests foreground location permission. Returns true if granted. */
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === Location.PermissionStatus.GRANTED;
}

/** True if foreground location permission is already granted. */
export async function hasLocationPermission(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === Location.PermissionStatus.GRANTED;
}

/**
 * Gets the current device position. Requests permission first if needed.
 * Returns null when permission is denied.
 */
export async function getCurrentPosition(): Promise<Coordinates | null> {
  const granted = (await hasLocationPermission()) || (await requestLocationPermission());
  if (!granted) return null;

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy ?? null,
    timestamp: position.timestamp,
  };
}
