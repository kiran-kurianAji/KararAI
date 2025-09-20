# Multilingual Voice/Text AI Chatbot

A free multilingual AI chatbot that supports voice and text input in Hindi, Malayalam, and English. Features speech-to-text using OpenAI Whisper, translation using Google Translate, and text-to-speech using gTTS.

## Features

- 🎤 **Voice Input**: Support for Hindi and Malayalam speech recognition
- 📝 **Text Input**: Direct text input support
- 🗣️ **Speech-to-Text**: Local OpenAI Whisper model for accurate transcription
- 🌐 **Translation**: Google Translate integration for language conversion
- 🤖 **AI Responses**: Placeholder function ready for local LLM integration
- 🔊 **Text-to-Speech**: gTTS for natural voice output
- 🖥️ **GUI Interface**: User-friendly Tkinter interface

## Requirements

- Python 3.8 or higher
- Internet connection (for translation services)
- Microphone and speakers/headphones
- Windows/Linux/macOS

## Installation

### Option 1: Automated Setup (Recommended)

```bash
cd ai
python setup.py
```

### Option 2: Manual Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the chatbot:
```bash
python multilingual_chatbot.py
```

## Usage

### Starting the Chatbot

```bash
python multilingual_chatbot.py
```

### Using Voice Input

1. Select your input language (Hindi/Malayalam/English)
2. Click "🎤 Start Voice Input" button
3. Speak clearly into your microphone
4. Click "🛑 Stop Recording" when finished
5. The chatbot will process your speech and respond

### Using Text Input

1. Type your message in the text box
2. Press Ctrl+Enter or click "Send Text"
3. The chatbot will process and respond

### Language Settings

- **Input Language**: Choose the language you'll speak/type in
- **Output Language**: Choose the language for AI responses
- The chatbot automatically translates between languages as needed

## Features in Detail

### Speech-to-Text (Whisper)
- Uses OpenAI's Whisper model locally (no internet required for STT)
- Supports Hindi, Malayalam, and English
- High accuracy transcription
- Processes up to 10 seconds of audio per recording

### Translation (Google Translate)
- Translates input to English for AI processing
- Translates AI responses back to your preferred language
- Supports Hindi, Malayalam, and English
- Requires internet connection

### AI Response Generation
- Currently uses placeholder responses
- Ready for integration with:
  - Local LLMs (Ollama, GPT4All, etc.)
  - Free AI APIs
  - Custom rule-based systems

### Text-to-Speech (gTTS)
- Natural voice output in your chosen language
- Supports Hindi, Malayalam, and English
- Plays responses automatically after generation

## Customization

### Adding a Local LLM

Replace the `generate_ai_response()` function in `multilingual_chatbot.py`:

```python
def generate_ai_response(self, message):
    # Example with Ollama
    import requests
    response = requests.post('http://localhost:11434/api/generate',
                           json={'model': 'llama2', 'prompt': message})
    return response.json()['response']
```

### Adding More Languages

1. Add language options to the UI comboboxes
2. Update the language mapping in `on_input_language_change()` and `on_output_language_change()`
3. Ensure gTTS supports the new language

## Troubleshooting

### Common Issues

1. **"No module named 'whisper'"**
   - Run: `pip install openai-whisper`

2. **Audio device not found**
   - Check microphone permissions
   - Verify audio devices in system settings

3. **Translation errors**
   - Check internet connection
   - Google Translate may have rate limits

4. **Whisper model download fails**
   - Check internet connection
   - Ensure sufficient disk space (~1GB for base model)

### Performance Tips

- Use the "base" Whisper model for good balance of speed/accuracy
- For faster processing, use "tiny" model: `whisper.load_model("tiny")`
- For better accuracy, use "small" or "medium" models

## File Structure

```
ai/
├── multilingual_chatbot.py    # Main application
├── setup.py                   # Setup script
├── requirements.txt           # Python dependencies
└── readme.md                 # This file
```

## Dependencies

- `whisper`: OpenAI's speech recognition model
- `googletrans==4.0.0-rc1`: Google Translate API
- `gtts`: Google Text-to-Speech
- `sounddevice`: Audio recording
- `scipy`: Scientific computing
- `numpy`: Numerical computing
- `pygame`: Audio playback
- `tkinter`: GUI framework (included with Python)

## License

This project is open source and free to use. Please note that it uses Google's translation and TTS services which may have usage limits.

## Contributing

Feel free to contribute improvements, bug fixes, or additional language support!

## Support

For issues or questions:
1. Check the troubleshooting section
2. Ensure all dependencies are properly installed
3. Verify your audio system is working
4. Check internet connection for translation services