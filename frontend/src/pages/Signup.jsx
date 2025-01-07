import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const SignupContainer = styled.div`
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f4f4f4;
`;

const SignupForm = styled.div`
  margin: 5% 25%;
  padding: 5%;
  width: 30vw;
  height: auto;
  border: 2px solid #bdc5dd;
  border-radius: 20px;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  color: #3d5ab8;
  margin: 5% 0;
  font-size: 30px;
  font-family: "GowunDodum-Regular";
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
  font-family: "GowunDodum-Regular";
`;

const Select = styled.select`
  width: calc(100% - 20px);
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
  border: 1px solid #bdc5dd;
  font-family: "GowunDodum-Regular";

  &:focus {
    outline: none;
    border-color: #3d5ab8;
    box-shadow: 0 0 5px rgba(61, 90, 184, 0.5);
  }
`;

const Input = styled.input`
  width: calc(100% - 20px);
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
  border: 1px solid #bdc5dd;
  font-family: "GowunDodum-Regular";

  &:focus {
    outline: none;
    border-color: #3d5ab8;
    box-shadow: 0 0 5px rgba(61, 90, 184, 0.5);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 10px;
`;

const Button = styled.button`
  width: 50%;
  padding: 10px;
  background-color: #3d5ab8;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  font-family: "GowunDodum-Regular";

  &:hover {
    background-color: #2c4a9d;
    transition: background-color 0.3s ease;
  }
`;

const LoginButton = styled(Button)`
  background-color: #feb3aa;
  width: 50%;

  &:hover {
    background-color: #f08c7b;
    transition: background-color 0.3s ease;
  }
`;

const Signup = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");

  const handleSignup = async () => {
    if (username && password && age && country) {
      const userData = {
        username,
        password,
        age,
        country,
      };

      try {
        const response = await fetch("http://localhost:5000/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Registration successful!");
          navigate("/api/login");
        } else {
          alert(`Error: ${data.message || 'Please try again.'}`);
        }
      } catch (error) {
        console.error("Error during signup:", error);
        alert("An error occurred. Please try again.");
      }
    } else {
      alert("Please enter your information.");
    }
  };

  return (
    <SignupContainer>
      <SignupForm>
        <Title>Sign Up</Title>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            type="text"
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="age">Age</Label>
          <Select id="age" value={age} onChange={(e) => setAge(e.target.value)}>
            <option value="">Select your age group</option>
            <option value="10-19">10-19</option>
            <option value="20-29">20-29</option>
            <option value="30-39">30-39</option>
            <option value="40-49">40-49</option>
            <option value="50-59">50-59</option>
            <option value="60+">60+</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">Select your country</option>
            <option value="US">English (United States)</option>
            <option value="CA">English/French (Canada)</option>
            <option value="GB">English (United Kingdom)</option>
            <option value="AU">English (Australia)</option>
            <option value="DE">Deutsch (Deutschland)</option>
            <option value="FR">Français (France)</option>
            <option value="IN">हिन्दी/English (India)</option>
            <option value="JP">日本語 (日本)</option>
            <option value="BR">Português (Brasil)</option>
            <option value="ZA">English/Afrikaans/Zulu (South Africa)</option>
            <option value="IT">Italiano (Italia)</option>
            <option value="MX">Español (México)</option>
            <option value="ES">Español (España)</option>
            <option value="NG">English (Nigeria)</option>
            <option value="ID">Bahasa Indonesia (Indonesia)</option>
            <option value="PH">English/Filipino (Philippines)</option>
            <option value="RU">Русский (Россия)</option>
            <option value="KR">한국어 (대한민국)</option>
            <option value="SG">English/华文/தமிழ் (Singapore)</option>
            <option value="TH">ไทย (ประเทศไทย)</option>hei
            <option value="VN">Tiếng Việt (Việt Nam)</option>
            <option value="TR">Türkçe (Türkiye)</option>
            <option value="CN">中文 (中国)</option>
            <option value="TW">中文 (台灣)</option>
            <option value="AR">العربية (الإمارات)</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <ButtonContainer>
          <Button onClick={handleSignup}>Sign Up</Button>
          <LoginButton onClick={() => navigate("/login")}>Login</LoginButton>
        </ButtonContainer>
      </SignupForm>
    </SignupContainer>
  );
};

export default Signup;
