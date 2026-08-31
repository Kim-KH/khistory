import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import GroupScreen from './screens/GroupScreen';
import DynastyScreen from './screens/DynastyScreen';
import KingDetailScreen from './screens/KingDetailScreen';
import HotCornerListScreen from './screens/HotCornerListScreen';
import HotCornerDetailScreen from './screens/HotCornerDetailScreen';
import TopicListScreen from './screens/TopicListScreen';
import TopicDetailScreen from './screens/TopicDetailScreen';
import QuizHomeScreen from './screens/QuizHomeScreen';
import QuizScreen from './screens/QuizScreen';
import QuizResultScreen from './screens/QuizResultScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Group" component={GroupScreen} />
          <Stack.Screen name="Dynasty" component={DynastyScreen} />
          <Stack.Screen name="KingDetail" component={KingDetailScreen} />
          <Stack.Screen name="HotCornerList" component={HotCornerListScreen} />
          <Stack.Screen name="HotCornerDetail" component={HotCornerDetailScreen} />
          <Stack.Screen name="TopicList" component={TopicListScreen} />
          <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
          <Stack.Screen name="QuizHome" component={QuizHomeScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="QuizResult" component={QuizResultScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
