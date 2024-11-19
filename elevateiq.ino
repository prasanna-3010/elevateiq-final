#include <WiFi.h>
#include <HTTPClient.h>
#include <HX711.h>

// Wi-Fi Credentials
const char* ssid = "Airtel_0864";           // Replace with your Wi-Fi SSID
const char* password = "air97449";   // Replace with your Wi-Fi password

// Server URL
const char* serverURL = "http://192.168.1.6:4002"; // Replace with your server's IP address

// HX711 Setup
#define DT 18 // Data pin
#define SCK 19 // Clock pin

HX711 scale;
float calibration_factor = -7050; // Adjust this value
long tare_offset = 0;

// Ultrasonic Sensor Setup
#define TRIGGER_PIN 22 // Trigger pin
#define ECHO_PIN 23    // Echo pin

void setup() {
  // Initialize Serial Monitor
  Serial.begin(115200);

  // Initialize Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnected to Wi-Fi");

  // HX711 Initialization
  scale.begin(DT, SCK);
  Serial.println("Initializing scale...");
  tare_offset = getTare(); // Get tare offset
  Serial.print("Tare Offset: ");
  Serial.println(tare_offset);
  delay(5000); // Wait for initialization

  // Ultrasonic Sensor Initialization
  pinMode(TRIGGER_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  // Measure weight
  long raw_value = scale.get_value(10); // Get average of 10 readings
  long net_value = raw_value - tare_offset; // Subtract tare offset
  float weight = net_value / calibration_factor; // Calculate weight

  Serial.print("Weight: ");
  Serial.print(weight);
  Serial.println(" grams");

  // Measure distance
  float distance = getDistance();

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // Send data to server
  sendDataToServer(weight, distance);

  delay(1000); // 1-second delay
}

// Function to tare the scale
long getTare() {
  long tare_value = 0;
  for (int i = 0; i < 10; i++) { // Average over 10 readings
    tare_value += scale.get_value();
    delay(50);
  }
  return tare_value / 10;
}

// Function to measure distance using ultrasonic sensor
float getDistance() {
  // Send a 10us pulse to trigger pin
  digitalWrite(TRIGGER_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIGGER_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIGGER_PIN, LOW);

  // Read the echo pin and calculate the duration
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout for ~5m range

  // Calculate distance in cm
  float distance = duration * 0.034 / 2; // Speed of sound = 0.034 cm/us
  return distance;
}

// Function to send data to the server
void sendDataToServer(float weight, float distance) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Send weight data
    String weightURL = String(serverURL) + "/update-weight?weight=" + String(weight, 2);
    http.begin(weightURL);
    int weightResponse = http.GET();
    if (weightResponse > 0) {
      Serial.print("Weight Response: ");
      Serial.println(weightResponse);
    } else {
      Serial.print("Error sending weight: ");
      Serial.println(http.errorToString(weightResponse).c_str());
    }
    http.end();

    // Send distance data
    String distanceURL = String(serverURL) + "/update-distance?distance=" + String(distance, 2);
    http.begin(distanceURL);
    int distanceResponse = http.GET();
    if (distanceResponse > 0) {
      Serial.print("Distance Response: ");
      Serial.println(distanceResponse);
    } else {
      Serial.print("Error sending distance: ");
      Serial.println(http.errorToString(distanceResponse).c_str());
    }
    http.end();
  } else {
    Serial.println("Wi-Fi not connected. Cannot send data.");
  }
}
