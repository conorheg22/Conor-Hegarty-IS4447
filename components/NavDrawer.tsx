import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { label: '✈️   Trips', route: '/trips' },
  { label: '🏃   Activities', route: '/activities' },
  { label: '🏷️   Categories', route: '/categories' },
  { label: '🎯   Targets', route: '/targets' },
  { label: '📊   Insights', route: '/insights' },
  { label: '🗑️   Delete Account', route: '/delete-profile' },
];

export function NavDrawer() {
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-270)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { logout } = useAuth();

  function openMenu() {
    setOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  }

  function closeMenu(cb?: () => void) {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -270, duration: 210, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 210, useNativeDriver: true }),
    ]).start(() => {
      setOpen(false);
      cb?.();
    });
  }

  function navigate(route: string) {
    closeMenu(() => router.push(route as any));
  }

  async function handleLogout() {
    closeMenu();
    await logout();
    router.replace('/login');
  }

  return (
    <>
      {/* Floating hamburger button */}
      <Pressable
        onPress={openMenu}
        style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.85 : 1 }]}
        hitSlop={10}
      >
        <View style={styles.bar} />
        <View style={styles.bar} />
        <View style={styles.bar} />
      </Pressable>

      {open && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* Backdrop */}
          <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, { opacity: fadeAnim }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => closeMenu()} activeOpacity={1} />
          </Animated.View>

          {/* Drawer panel */}
          <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
            <Text style={styles.drawerTitle}>Menu</Text>
            {NAV_ITEMS.map((item) => (
              <Pressable
                key={item.route}
                style={({ pressed }) => [styles.drawerItem, pressed && styles.drawerItemPressed]}
                onPress={() => navigate(item.route)}
              >
                <Text style={styles.drawerItemText}>{item.label}</Text>
              </Pressable>
            ))}
            <Pressable
              style={({ pressed }) => [styles.drawerItem, styles.logoutItem, pressed && styles.drawerItemPressed]}
              onPress={() => void handleLogout()}
            >
              <Text style={[styles.drawerItemText, { color: '#FF4757' }]}>🚪   Logout</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
    zIndex: 50,
  },
  bar: {
    width: 20,
    height: 2.5,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 200,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 270,
    backgroundColor: '#1A2F45',
    zIndex: 201,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowOffset: { width: 6, height: 0 },
    shadowRadius: 16,
    elevation: 24,
  },
  drawerTitle: {
    color: '#FF6B6B',
    fontSize: 22,
    fontWeight: '800',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  drawerItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2A4060',
  },
  drawerItemPressed: {
    backgroundColor: '#243548',
  },
  drawerItemText: {
    color: '#FFF9F0',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutItem: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A4060',
  },
});