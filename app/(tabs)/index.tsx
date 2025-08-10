import HomeScreen from '@/src/screens/HomeScreen';
import { SwipeableScreen } from '@/src/components/SwipeableScreen';

export default function TabIndex() {
  return (
    <SwipeableScreen>
      <HomeScreen />
    </SwipeableScreen>
  );
}