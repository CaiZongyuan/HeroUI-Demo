import { Text, TouchableOpacity, View } from "react-native";

export const ToolPartsRenderer = ({
  parts,
  addToolOutput,
}: {
  parts: any[];
  addToolOutput: (args: any) => void;
}) => {
  return (
    <View>
      {parts.map((part) => {
        switch (part.type) {
          case "tool-askForConfirmation": {
            const callId = part.toolCallId;
            switch (part.state) {
              case "input-streaming":
                return (
                  <Text key={callId} style={{ color: "#fff" }}>
                    Loading confirmation request...
                  </Text>
                );
              case "input-available":
                return (
                  <View key={callId} style={{ marginVertical: 8 }}>
                    <Text style={{ color: "#fff", marginBottom: 8 }}>
                      {part.input.message}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <TouchableOpacity
                        onPress={() =>
                          addToolOutput({
                            tool: "askForConfirmation",
                            toolCallId: callId,
                            output: "Yes, confirmed.",
                          })
                        }
                        style={{
                          backgroundColor: "#27272a",
                          padding: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: "#fff" }}>Yes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          addToolOutput({
                            tool: "askForConfirmation",
                            toolCallId: callId,
                            output: "No, denied",
                          })
                        }
                        style={{
                          backgroundColor: "#27272a",
                          padding: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: "#fff" }}>No</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              case "output-available":
                return (
                  <Text key={callId} style={{ color: "#fff" }}>
                    Location access allowed: {part.output}
                  </Text>
                );
              case "output-error":
                return (
                  <Text key={callId} style={{ color: "red" }}>
                    Error: {part.errorText}
                  </Text>
                );
            }
            break;
          }
          case "tool-getLocation": {
            const callId = part.toolCallId;
            switch (part.state) {
              case "input-streaming":
                return (
                  <Text key={callId} style={{ color: "#fff" }}>
                    Preparing location request...
                  </Text>
                );
              case "input-available":
                return (
                  <Text key={callId} style={{ color: "#fff" }}>
                    Getting location...
                  </Text>
                );
              case "output-available":
                return (
                  <Text key={callId} style={{ color: "#fff" }}>
                    Location: {part.output}
                  </Text>
                );
              case "output-error":
                return (
                  <Text key={callId} style={{ color: "red" }}>
                    Error getting location: {part.errorText}
                  </Text>
                );
            }
            break;
          }
          case "tool-getWeatherInformation": {
            const callId = part.toolCallId;
            switch (part.state) {
              case "input-streaming":
                return (
                  <Text key={callId} style={{ color: "#fff" }}>
                    {JSON.stringify(part, null, 2)}
                  </Text>
                );
              case "input-available":
                return (
                  <Text key={callId} style={{ color: "#fff" }}>
                    Getting weather information for {part.input.city}...
                  </Text>
                );
              case "output-available":
                return (
                  <Text key={callId} style={{ color: "#fff" }}>
                    Weather in {part.input.city}: {part.output}
                  </Text>
                );
              case "output-error":
                return (
                  <Text key={callId} style={{ color: "red" }}>
                    Error getting weather for {part.input.city}:{" "}
                    {part.errorText}
                  </Text>
                );
            }
            break;
          }
          default:
            return null;
        }
      })}
    </View>
  );
};
