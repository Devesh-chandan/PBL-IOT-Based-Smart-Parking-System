// ============================================================
// LIBRARY INSTALLATION GUIDE
// ============================================================
// 1. Install ESP32 Board Package:
//    - Open Arduino IDE
//    - Go to File → Preferences
//    - Add this URL to Additional Board Manager URLs:
//      https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
//    - Go to Tools → Board → Board Manager
//    - Search "ESP32" and install "esp32 by Espressif Systems"
//
// 2. Install ESP32Servo Library:
//    - Go to Tools → Library Manager
//    - Search "ESP32Servo"
//    - Install "ESP32Servo by Kevin Harrington"
//
// 3. These libraries are included with ESP32 board package
//    and DO NOT need separate installation:
//    - WiFi.h
//    - HTTPClient.h
//    - esp_camera.h
// ============================================================

// ============================================================
// ARDUINO IDE BOARD SETTINGS
// ============================================================
// Go to Tools menu and set these EXACTLY:
//
//   Board:             AI Thinker ESP32-CAM
//   Upload Speed:      115200
//   CPU Frequency:     240MHz
//   Flash Frequency:   80MHz
//   Flash Mode:        QIO
//   Flash Size:        4MB (32Mb)
//   Partition Scheme:  Huge APP (3MB No OTA)
//   Core Debug Level:  None
//   Port:              COMx (check Device Manager for correct port)
// ============================================================

// ============================================================
// FT232RL WIRING FOR CODE UPLOAD
// ============================================================
//   FT232RL TX  →  ESP32-CAM U0R (RX)
//   FT232RL RX  →  ESP32-CAM U0T (TX)
//   FT232RL GND →  ESP32-CAM GND
//   FT232RL VCC →  UNCONNECTED (powered by 5V adapter)
//   FT232RL DTR →  UNCONNECTED (not needed)
//   FT232RL CTS →  UNCONNECTED (not needed)
//
// IMPORTANT: FT232RL must be set to 3.3V logic level
//            NOT 5V — check the voltage select jumper
//            on your FT232RL board before connecting!
//            5V logic will damage the ESP32-CAM's UART pins
// ============================================================

// ============================================================
// CODE UPLOAD PROCEDURE
// ============================================================
// UPLOADING CODE:
//   1. Connect FT232RL to PC via USB
//   2. Connect FT232RL TX, RX, GND to ESP32-CAM
//   3. INSERT GPIO0 to GND jumper on PCB
//   4. Plug in 5V adapter to power the circuit
//      (ESP32-CAM boots into flash/bootloader mode
//       because GPIO0 is LOW on power up)
//   5. Select correct COM port in Arduino IDE
//   6. Click Upload in Arduino IDE
//   7. Wait for "Connecting..." in Arduino IDE output
//   8. Upload will proceed automatically
//   9. Wait for "Done uploading" message
//
// RUNNING CODE AFTER UPLOAD:
//   10. REMOVE GPIO0 to GND jumper
//   11. Unplug and replug 5V adapter (power cycle)
//       (ESP32-CAM now boots normally and runs your code
//        because GPIO0 is HIGH/floating on power up)
//
// WARNING: If you forget step 10, the ESP32-CAM will
//          always boot into flash mode and your code
//          will never run!
// ============================================================

// ============================================================
// SERIAL MONITOR
// ============================================================
// To view debug output after uploading:
//   1. Make sure GPIO0 jumper is REMOVED
//   2. Keep FT232RL connected to PC
//   3. Open Arduino IDE Serial Monitor
//   4. Set baud rate to 115200 (bottom right of Serial Monitor)
//   5. Power cycle ESP32-CAM
//   6. You should see boot messages immediately
//
// NOTE: You can keep FT232RL connected during normal
//       operation for debugging — it does not interfere
//       with WiFi or camera operation
// ============================================================

// ============================================================
// ANTENNA PRECAUTION
// ============================================================
// The ESP32-CAM PCB antenna is located at the edge of the
// module OPPOSITE to the camera.
// Keep all wires at least 1-2cm away from this end.
// Never run wires parallel to the antenna edge.
// If WiFi signal is weak, consider using the IPEX connector
// with an external 2.4GHz antenna by moving the small 0ohm
// resistor on the ESP32-CAM from PCB antenna to IPEX position
// ============================================================

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "esp_camera.h"
#include <ESP32Servo.h>

// ============================================================
// WiFi and Server Configuration
// ============================================================
const char* WIFI_SSID     = "";
const char* WIFI_PASSWORD = "";
const char* SERVER_URL    = "";
// NOTE: 192.168.43.x is the typical subnet for Android hotspots
// Find your computer's exact IP by:
//   Windows: Open CMD → type ipconfig → look for WiFi IPv4 address
//   Linux:   Open terminal → type ifconfig or ip addr
// Set a static IP on your computer to avoid it changing
// ============================================================

// ============================================================
// Pin Definitions
// ============================================================
#define TRIG_PIN        12      // GPIO12 → Ultrasonic TRIG
#define ECHO_PIN        13      // GPIO13 → Ultrasonic ECHO (via voltage divider)
#define SERVO_ENTRY_PIN 15      // GPIO15 → Entry servo PWM
#define SERVO_EXIT_PIN  14      // GPIO14 → Exit servo PWM

// ESP32-CAM AI-Thinker camera pin definitions
// DO NOT CHANGE THESE — fixed by hardware design
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22
// ============================================================

// ============================================================
// Constants — adjust these to suit your physical setup
// ============================================================
#define DETECTION_DISTANCE_CM   50      // Trigger distance in cm
#define BARRIER_RAISE_DELAY_MS  5000    // Time barrier stays raised (ms)
#define SERVO_RAISED_ANGLE      90      // Servo angle when raised
#define SERVO_LOWERED_ANGLE     0       // Servo angle when lowered
#define DEBOUNCE_DELAY_MS       3000    // Minimum time between triggers
#define SOUND_SPEED_CM_US       0.034   // Speed of sound in cm/µs
// ============================================================

Servo entryServo;
Servo exitServo;

unsigned long lastTriggerTime = 0;

// ============================================================
// Function Prototypes
// ============================================================
float measureDistance();
bool captureAndSendImage(String& responsePayload);
void raiseBarrier(bool isEntry);
void lowerBarrier(bool isEntry);
bool initCamera();
void connectWiFi();

// ============================================================
// Setup
// ============================================================
void setup() {
    // Initialize serial communication for debugging
    // View output in Arduino IDE Serial Monitor at 115200 baud
    Serial.begin(115200);
    Serial.println("\n[BOOT] Smart Parking System Starting...");

    // Ultrasonic sensor pin setup
    // TRIG is output — we send the pulse
    // ECHO is input — we receive the reflected pulse
    // NOTE: ECHO pin uses voltage divider on PCB because
    //       HC-SR04 outputs 5V but ESP32 GPIO is 3.3V max
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    digitalWrite(TRIG_PIN, LOW);

    // Servo setup
    // Both barriers start in lowered position on power up
    // Adjust SERVO_RAISED_ANGLE and SERVO_LOWERED_ANGLE
    // constants above to match your physical servo orientation
    entryServo.attach(SERVO_ENTRY_PIN);
    exitServo.attach(SERVO_EXIT_PIN);
    entryServo.write(SERVO_LOWERED_ANGLE);
    exitServo.write(SERVO_LOWERED_ANGLE);
    Serial.println("[SERVO] Barriers initialized to lowered position");

    // Camera initialization
    // If camera init fails, system restarts automatically
    // Common causes of failure:
    //   - Loose camera ribbon cable
    //   - Insufficient power supply
    //   - Incorrect camera pin definitions above
    if (!initCamera()) {
        Serial.println("[ERROR] Camera init failed! Restarting...");
        delay(2000);
        ESP.restart();
    }
    Serial.println("[CAMERA] Initialized successfully");

    // WiFi connection
    // If connection fails after 20 attempts, system restarts
    // Make sure hotspot is active before powering the circuit
    connectWiFi();

    Serial.println("[BOOT] System ready. Monitoring for vehicles...");
}

// ============================================================
// Main Loop
// ============================================================
void loop() {
    float distance = measureDistance();

    Serial.print("[SENSOR] Distance: ");
    Serial.print(distance);
    Serial.println(" cm");

    // Trigger only if:
    // 1. Valid distance reading (not -1 timeout)
    // 2. Object within detection range
    // 3. Debounce time elapsed since last trigger
    //    (prevents multiple triggers for same car)
    if (distance > 0 &&
        distance < DETECTION_DISTANCE_CM &&
        (millis() - lastTriggerTime) > DEBOUNCE_DELAY_MS) {

        lastTriggerTime = millis();
        Serial.println("[TRIGGER] Vehicle detected! Capturing image...");

        // Small delay to let car position itself
        // in front of camera for best plate capture
        delay(500);

        String serverResponse = "";
        bool success = captureAndSendImage(serverResponse);

        if (success) {
            Serial.print("[SERVER] Response: ");
            Serial.println(serverResponse);

            // Parse JSON response from Flask server
            // Flask returns one of these:
            // {"status": "entry", "plate": "MH12AB1234"}
            // {"status": "exit",  "plate": "MH12AB1234"}
            // {"status": "error", "message": "..."}
            // Checking for both spaced and unspaced JSON formats
            if (serverResponse.indexOf("\"status\":\"entry\"") >= 0 ||
                serverResponse.indexOf("\"status\": \"entry\"") >= 0) {
                Serial.println("[PARKING] New vehicle — raising ENTRY barrier");
                raiseBarrier(true);
                delay(BARRIER_RAISE_DELAY_MS);
                lowerBarrier(true);

            } else if (serverResponse.indexOf("\"status\":\"exit\"") >= 0 ||
                       serverResponse.indexOf("\"status\": \"exit\"") >= 0) {
                Serial.println("[PARKING] Exiting vehicle — raising EXIT barrier");
                raiseBarrier(false);
                delay(BARRIER_RAISE_DELAY_MS);
                lowerBarrier(false);

            } else {
                // This happens if:
                // - Plate not recognized by OCR
                // - Flask server returned an error
                // - Unregistered plate number
                Serial.println("[WARNING] Unknown or error response from server");
            }

        } else {
            Serial.println("[ERROR] Failed to capture or send image");
        }
    }

    // 200ms polling interval for ultrasonic sensor
    // Do not reduce below 60ms — HC-SR04 minimum cycle time
    delay(200);
}

// ============================================================
// Measure distance using HC-SR04 ultrasonic sensor
// Returns distance in cm, or -1 on timeout
// ============================================================
float measureDistance() {
    // Send 10µs trigger pulse
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    // Measure echo pulse duration
    // 30000µs timeout = ~5 meter max range
    // Returns 0 if no echo received within timeout
    long duration = pulseIn(ECHO_PIN, HIGH, 30000);

    if (duration == 0) {
        return -1; // No echo — object out of range or sensor error
    }

    // Convert duration to distance
    // Distance = (duration × speed of sound) / 2
    // Divide by 2 because sound travels to object AND back
    return (duration * SOUND_SPEED_CM_US) / 2.0;
}

// ============================================================
// Capture JPEG image and HTTP POST to Flask server
// Returns true on HTTP 200, fills responsePayload string
// ============================================================
bool captureAndSendImage(String& responsePayload) {
    // Flush stale frame from buffer
    // ESP32-CAM buffers the last frame continuously
    // First capture is often an old frame — discard it
    camera_fb_t* fb = NULL;
    fb = esp_camera_fb_get();
    if (fb) esp_camera_fb_return(fb);
    delay(100);

    // Capture fresh frame
    fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("[CAMERA] Frame capture failed");
        return false;
    }

    Serial.print("[CAMERA] Captured image, size: ");
    Serial.print(fb->len);
    Serial.println(" bytes");

    // Verify WiFi still connected before attempting HTTP
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[WiFi] Disconnected! Reconnecting...");
        connectWiFi();
    }

    HTTPClient http;
    http.begin(SERVER_URL);

    // Tell Flask server we are sending a JPEG image
    http.addHeader("Content-Type", "image/jpeg");

    // 10 second timeout — gives ML model enough time to process
    // Increase this if your OCR model is slow
    http.setTimeout(10000);

    // POST raw JPEG bytes to Flask server
    // fb->buf = pointer to image data in memory
    // fb->len = size of image in bytes
    int httpResponseCode = http.POST(fb->buf, fb->len);

    // Always return frame buffer to free memory
    // Failing to do this will cause memory leak and crash
    esp_camera_fb_return(fb);

    if (httpResponseCode == 200) {
        responsePayload = http.getString();
        http.end();
        return true;
    } else {
        Serial.print("[HTTP] Error code: ");
        Serial.println(httpResponseCode);
        http.end();
        return false;
    }
}

// ============================================================
// Raise barrier servo
// isEntry = true  → entry servo (GPIO15)
// isEntry = false → exit servo  (GPIO14)
// ============================================================
void raiseBarrier(bool isEntry) {
    if (isEntry) {
        entryServo.write(SERVO_RAISED_ANGLE);
        Serial.println("[SERVO] Entry barrier RAISED");
    } else {
        exitServo.write(SERVO_RAISED_ANGLE);
        Serial.println("[SERVO] Exit barrier RAISED");
    }
}

// ============================================================
// Lower barrier servo
// ============================================================
void lowerBarrier(bool isEntry) {
    if (isEntry) {
        entryServo.write(SERVO_LOWERED_ANGLE);
        Serial.println("[SERVO] Entry barrier LOWERED");
    } else {
        exitServo.write(SERVO_LOWERED_ANGLE);
        Serial.println("[SERVO] Exit barrier LOWERED");
    }
}

// ============================================================
// Initialize OV3660 camera
// ============================================================
bool initCamera() {
    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer   = LEDC_TIMER_0;
    config.pin_d0       = Y2_GPIO_NUM;
    config.pin_d1       = Y3_GPIO_NUM;
    config.pin_d2       = Y4_GPIO_NUM;
    config.pin_d3       = Y5_GPIO_NUM;
    config.pin_d4       = Y6_GPIO_NUM;
    config.pin_d5       = Y7_GPIO_NUM;
    config.pin_d6       = Y8_GPIO_NUM;
    config.pin_d7       = Y9_GPIO_NUM;
    config.pin_xclk     = XCLK_GPIO_NUM;
    config.pin_pclk     = PCLK_GPIO_NUM;
    config.pin_vsync    = VSYNC_GPIO_NUM;
    config.pin_href     = HREF_GPIO_NUM;
    config.pin_sscb_sda = SIOD_GPIO_NUM;
    config.pin_sscb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn     = PWDN_GPIO_NUM;
    config.pin_reset    = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_JPEG;

    // Higher resolution and quality if PSRAM available
    // ESP32-CAM AI-Thinker has 4MB PSRAM onboard
    // so this branch will always be taken on your hardware
    if (psramFound()) {
        config.frame_size   = FRAMESIZE_VGA;  // 640x480 — good for plate recognition
        config.jpeg_quality = 10;             // 0-63, lower = better quality
        config.fb_count     = 2;              // Double buffer for smoother capture
    } else {
        config.frame_size   = FRAMESIZE_CIF;  // 352x288 fallback
        config.jpeg_quality = 12;
        config.fb_count     = 1;
    }

    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("[CAMERA] Init error: 0x%x\n", err);
        return false;
    }

    // OV3660 specific image corrections
    sensor_t* s = esp_camera_sensor_get();
    s->set_vflip(s, 1);          // OV3660 image is vertically flipped by default
    s->set_hmirror(s, 0);        // OV3660 image is horizontally mirrored by default
    s->set_brightness(s, 1);     // Slightly brighter for outdoor use
    s->set_contrast(s, 1);       // Higher contrast helps plate recognition
    s->set_saturation(s, 0);     // Neutral saturation
    s->set_sharpness(s, 1);      // Sharper edges improve OCR accuracy
    s->set_whitebal(s, 1);       // Auto white balance for varying light conditions
    s->set_exposure_ctrl(s, 1);  // Auto exposure for varying light conditions
    s->set_aec2(s, 1);           // AEC DSP on for better exposure control

    return true;
}

// ============================================================
// Connect to WiFi (Mobile Hotspot)
// ============================================================
void connectWiFi() {
    Serial.print("[WiFi] Connecting to ");
    Serial.println(WIFI_SSID);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    int attempts = 0;

    // Try connecting every 500ms for up to 10 seconds
    // Make sure hotspot is active BEFORE powering the circuit
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n[WiFi] Connected!");
        Serial.print("[WiFi] ESP32-CAM IP Address: ");
        Serial.println(WiFi.localIP());
        // Note this IP — useful for debugging network issues
    } else {
        // If hotspot is not available, restart and try again
        // This handles cases where hotspot was not active at boot
        Serial.println("\n[WiFi] Connection failed! Restarting...");
        delay(2000);
        ESP.restart();
    }
}