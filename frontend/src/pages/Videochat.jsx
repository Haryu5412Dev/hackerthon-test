import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faPlus } from "@fortawesome/free-solid-svg-icons";
import Webcam from "react-webcam";
import axios from 'axios'; 

const FigureContainer = styled.div`
  display: flex;
  position: absolute;
  top: 30px;
  left: 25%;
`;

const ChatContainer = styled.div`
  width: 69.5vw;
  height: 45vh;
  background-color: #fff;
  border-radius: 25px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: absolute;
  top: 48%;
  left: 23.2%;
  overflow: hidden;
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 10px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-right: 50px;
  padding-top: 30px;
`;

const PlusIcon = styled.div`
  position: fixed;
  top: 50%;
  left: 24.3%;
  font-size: 28px;
  color: #007bff;
  cursor: pointer;
  z-index: 10;
  &:hover {
    color: #0056b3;
  }
`;

const Message = styled.div`
  background-color: #007bff;
  color: #fff;
  padding: 10px;
  border-radius: 10px;
  max-width: 70%;
  align-self: flex-end;
  margin-bottom: 5px;
`;

const InputContainer = styled.div`
  width: 70vw;
  height: 45px;
  display: flex;
  align-items: center;
  position: absolute;
  top: 88%;
  left: 23.5%;
  gap: 10px;
`;

const Input = styled.input`
  width: 62vw;
  margin: 0 10px 0 30px;
  border: 1px solid lightgray;
  outline: none;
  font-size: 16px;
  padding: 10px;
  border-radius: 10px;
`;

const SendButton = styled.button`
  width: 30px;
  height: 30px;
  background-color: #ccc;
  color: #fff;
  border: none;
  border-radius: 100%;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #0056b3;
  }
`;

const VideoChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("English"); // 기본 언어 설정
  const [targetLanguage, setTargetLanguage] = useState("Korean"); // 번역 대상 언어 설정
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() !== "") {
      // 입력된 메시지를 먼저 추가하고, 번역 처리
      setMessages((prevMessages) => [...prevMessages, { text: inputValue, isUser: true }]);
      setInputValue("");  // 메시지를 보낸 후 input을 비웁니다.
  
      try {
        // 서버에 요청을 보내는 부분
        const response = await axios.post("http://localhost:5000/api/translate", {
          source_language: sourceLanguage,
          target_language: targetLanguage,
          text: inputValue,  // 전송되는 텍스트가 맞는지 확인
        });
  
        // 번역된 메시지를 처리
        const translatedText = response.data.translated_text;
        if (translatedText) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: translatedText, isUser: false }  // 번역된 텍스트를 추가
          ]);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: "Error in translation", isUser: false }  // 번역 실패시 처리
          ]);
        }
      } catch (error) {
        console.error("번역 오류:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "Error in translation", isUser: false }  // 오류 처리
        ]);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div style={{ backgroundColor: "#C0C5D4", margin: 0, minHeight: "100vh" }}>
      <FigureContainer>
        <Webcam
          audio={false}
          height={300}
          screenshotFormat="image/jpeg"
          width={500}
          videoConstraints={{
            width: "500",
            height: "300",
            facingMode: "user",
          }}
          style={{
            border: "1px solid #c0c5d4",
          }}
        />
        <Webcam style={{ width: "35vw", height: "300px" }} />
      </FigureContainer>

      <ChatContainer>
        <MessagesContainer>
          <PlusIcon>
            <FontAwesomeIcon icon={faPlus} />
          </PlusIcon>
          {messages.map((msg, index) => (
            <Message key={index} style={{ backgroundColor: msg.isUser ? '#007bff' : '#f0f0f0', color: msg.isUser ? '#fff' : '#000' }}>
              {msg.text}
            </Message>
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>
      </ChatContainer>

      <InputContainer>
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="실시간으로 채팅하기"
        />
        <SendButton onClick={handleSendMessage}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </SendButton>
      </InputContainer>
    </div>
  );
};

export default VideoChat;
