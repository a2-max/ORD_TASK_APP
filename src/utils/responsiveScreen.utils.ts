import { Dimensions, PixelRatio } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const widthPercentageToDP = (widthPercent: number): number =>
  PixelRatio.roundToNearestPixel((screenWidth * widthPercent) / 100);

const heightPercentageToDP = (heightPercent: number): number =>
  PixelRatio.roundToNearestPixel((screenHeight * heightPercent) / 100);

export {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  screenWidth as SCREEN_WIDTH,
  screenHeight as SCREEN_HEIGHT,
};
