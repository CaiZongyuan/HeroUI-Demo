import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold">Hello HeroUI👌</Text>
      <Link href="/chatbot">Go to Chatbot</Link>
    </View>
  );
}
