#pragma once
// Stub for knolleary's PubSubClient MQTT library.
// - publish() appends to `published` vector so tests can inspect calls.
// - simulateReceive() fires the registered callback to test message handling.

#include "WiFiClientSecure.h"
#include <cstring>
#include <string>
#include <vector>
#include <functional>

typedef unsigned char byte;

struct PublishedMessage {
    std::string topic;
    std::string payload;
};

class PubSubClient {
public:
    std::vector<PublishedMessage> published;
    std::function<void(char*, byte*, unsigned int)> _callback;
    bool _connected = false;

    explicit PubSubClient(WiFiClientSecure& /*client*/) {}

    void setServer(const char* /*host*/, int /*port*/) {}

    void setCallback(std::function<void(char*, byte*, unsigned int)> cb) {
        _callback = cb;
    }

    bool connected()                                          { return _connected; }
    bool connect(const char*, const char*, const char*)       { return true; }
    bool subscribe(const char*)                               { return true; }
    bool loop()                                               { return true; }
    int  state()                                              { return 0; }

    bool publish(const char* topic, const char* payload) {
        published.push_back({topic, payload});
        return true;
    }

    // Fire the registered callback as if a message arrived on the broker.
    void simulateReceive(const char* topic, const char* payload) {
        if (_callback) {
            unsigned int len = (unsigned int)strlen(payload);
            _callback(const_cast<char*>(topic),
                      reinterpret_cast<byte*>(const_cast<char*>(payload)),
                      len);
        }
    }

    void clearPublished() { published.clear(); }
};
