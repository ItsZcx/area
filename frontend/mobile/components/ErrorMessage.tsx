import React from 'react';
import { Text, View } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return message ? (
    <StyledView className="mb-4">
      <StyledText className="text-red-500">{message}</StyledText>
    </StyledView>
  ) : null;
};

export default ErrorMessage;
