import { Stack } from "expo-router";
import { CreateProvider } from "./CreateContext";

export default function CreateLayout() {
  return (
    <CreateProvider>
      <Stack/>
    </CreateProvider>
  );
}
