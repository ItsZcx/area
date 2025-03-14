import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  isLoading: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress, isLoading }) => {
  return (
    <StyledTouchableOpacity
      disabled={isLoading}
      onPress={onPress}
      className={`w-full py-4 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-indigo-500'}`}
    >
      {isLoading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <StyledText className="text-center text-white text-lg font-semibold">{title}</StyledText>
      )}
    </StyledTouchableOpacity>
  );
};

export default CustomButton;
