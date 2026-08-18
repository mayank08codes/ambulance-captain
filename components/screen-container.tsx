import { View, Text, StyleSheet, Platform, useWindowDimensions, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { cn } from "@/lib/utils";

export interface ScreenContainerProps extends ViewProps {
  edges?: Edge[];
  className?: string;
  containerClassName?: string;
  safeAreaClassName?: string;
}

export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  className,
  containerClassName,
  safeAreaClassName,
  style,
  ...props
}: ScreenContainerProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 900;

  return (
    <View className={cn("flex-1", "bg-background", containerClassName)} {...props}>
      <SafeAreaView edges={edges} className={cn("flex-1", safeAreaClassName)} style={style}>
        {isDesktop ? (
          <View style={styles.desktopShell}>
            <View style={styles.sidebar}>
              <View style={styles.sidebarBrand}><View style={styles.brandIcon}><MaterialIcons name="local-hospital" size={20} color="#FFFFFF" /></View><Text style={styles.brandText}>Ambulance{`\n`}Captain</Text></View>
              <View style={styles.sidebarStatus}><View style={styles.statusDot} /><Text style={styles.sidebarStatusText}>Driver online</Text></View>
              <View style={styles.navList}>
                <View style={styles.navItemActive}><MaterialIcons name="dashboard" size={18} color="#FFFFFF" /><Text style={styles.navTextActive}>Dashboard</Text></View>
                <View style={styles.navItem}><MaterialIcons name="notifications-active" size={18} color="#9FB3C8" /><Text style={styles.navText}>Requests</Text><View style={styles.requestCount}><Text style={styles.requestCountText}>1</Text></View></View>
                <View style={styles.navItem}><MaterialIcons name="local-shipping" size={18} color="#9FB3C8" /><Text style={styles.navText}>Active trip</Text></View>
                <View style={styles.navItem}><MaterialIcons name="history" size={18} color="#9FB3C8" /><Text style={styles.navText}>Trip history</Text></View>
              </View>
              <View style={styles.sidebarBottom}><View style={styles.navItem}><MaterialIcons name="help-outline" size={18} color="#9FB3C8" /><Text style={styles.navText}>Help & support</Text></View><View style={styles.driverMini}><View style={styles.miniAvatar}><Text style={styles.miniAvatarText}>RK</Text></View><View><Text style={styles.miniName}>Ravi Kumar</Text><Text style={styles.miniRole}>Captain</Text></View></View></View>
            </View>
            <View style={styles.desktopMain}><View style={styles.workspaceBar}><Text style={styles.workspaceTitle}>Driver workspace</Text><View style={styles.workspaceMeta}><View style={styles.liveDot} /><Text style={styles.workspaceMetaText}>Live dispatch mode</Text></View></View><View style={styles.desktopContent}>{children}</View></View>
          </View>
        ) : (
          <View className={cn("flex-1", className)}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopShell: { flex: 1, flexDirection: "row", backgroundColor: "#F7FAFC" },
  sidebar: { width: 235, backgroundColor: "#102A43", paddingHorizontal: 18, paddingTop: 22, paddingBottom: 18 },
  sidebarBrand: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 23 },
  brandIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#D64545", alignItems: "center", justifyContent: "center" },
  brandText: { color: "#FFFFFF", fontSize: 15, lineHeight: 18, fontWeight: "900" },
  sidebarStatus: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#173B57", padding: 10, borderRadius: 10, marginBottom: 22 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2DD4BF" },
  sidebarStatusText: { color: "#B8C7D4", fontSize: 11, fontWeight: "800" },
  navList: { gap: 7 },
  navItemActive: { minHeight: 42, borderRadius: 10, backgroundColor: "#0F766E", flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 11 },
  navItem: { minHeight: 42, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 11 },
  navTextActive: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  navText: { color: "#B8C7D4", fontSize: 12, fontWeight: "700", flex: 1 },
  requestCount: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#D64545", alignItems: "center", justifyContent: "center" },
  requestCountText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  sidebarBottom: { marginTop: "auto", gap: 10 },
  driverMini: { flexDirection: "row", alignItems: "center", gap: 9, borderTopWidth: 1, borderTopColor: "#345A73", paddingTop: 16, marginTop: 8 },
  miniAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#2E5A7A", alignItems: "center", justifyContent: "center" },
  miniAvatarText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  miniName: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  miniRole: { color: "#9FB3C8", fontSize: 10, marginTop: 2 },
  desktopMain: { flex: 1, minWidth: 0 },
  workspaceBar: { height: 62, paddingHorizontal: 30, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#D9E2EC", backgroundColor: "#FFFFFF" },
  workspaceTitle: { color: "#102A43", fontSize: 16, fontWeight: "900" },
  workspaceMeta: { flexDirection: "row", alignItems: "center", gap: 7 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#0F766E" },
  workspaceMetaText: { color: "#52606D", fontSize: 12, fontWeight: "700" },
  desktopContent: { flex: 1, alignItems: "stretch" },
});
