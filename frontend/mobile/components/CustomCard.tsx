import { Dimensions } from "react-native";
import { Card, Title } from "react-native-paper";
import Icon from 'react-native-vector-icons/FontAwesome';
import { serviceMap } from "@/utils/serviceMap"

const numColumns = 2;
const cardWidth = Dimensions.get("window").width / numColumns - 20;

interface MyCardProps {
  title: string;
  onPress: () => void;
}

const CustomCard = ({ title, onPress }: MyCardProps) => {
  const service = serviceMap[title.toLowerCase()] || { name: title, color: "#000" };
  
  return (
    <Card
    style={{
      alignItems: "center",
      justifyContent: "center",
      width: cardWidth,
      height: cardWidth,
      margin: 10,
      backgroundColor: service.color,
    }}
      onPress={onPress}
    >
      <Card.Content style={{ alignItems: "center", justifyContent: "center" }}>
        <Icon name={service.icon} size={40} color="white" />
        <Title style={{ color: "white", fontWeight: "bold", marginVertical: 10}}>{service.name}</Title>
      </Card.Content>
    </Card>
  );
};

export default CustomCard