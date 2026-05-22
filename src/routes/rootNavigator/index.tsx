import { RootStackParamList } from '@interfaces/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateTaskScreen from '@screens/CreateTaskScreen';
import TaskDetailScreen from '@screens/TaskDetailScreen';
import TaskListScreen from '@screens/TaskListScreen';
import React from 'react';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="TaskListScreen" component={TaskListScreen} />
    <Stack.Screen name="TaskDetailScreen" component={TaskDetailScreen} />
    <Stack.Screen name="CreateTaskScreen" component={CreateTaskScreen} />
  </Stack.Navigator>
);

export default RootNavigator;
