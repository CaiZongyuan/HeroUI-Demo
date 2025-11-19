import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import { TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function ChatbotLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={({ navigation }) => ({
          headerShown: true,
          swipeEnabled: false, // Disable swipe to open, allows stack back swipe
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
              style={{ marginLeft: 16 }}
            >
              <Ionicons name="menu" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                // TODO: Handle new session
                console.log("New Session");
              }}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="add" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
        drawerContent={(props) => (
          <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
            <DrawerItem label="History Session 1" onPress={() => {}} />
            <DrawerItem label="History Session 2" onPress={() => {}} />
          </DrawerContentScrollView>
        )}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: "Chatbot",
            drawerLabel: "Current Chat",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
