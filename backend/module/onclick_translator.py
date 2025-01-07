from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import os

load_dotenv()

# API 키 설정
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY 설정 안 됨.")

# 국가 코드 -> 언어 매핑
COUNTRY_TO_LANGUAGE = {
    "US": "English",       # 미국
    "KR": "Korean",        # 한국
    "FR": "French",        # 프랑스
    "JP": "Japanese",      # 일본
    "DE": "German",        # 독일
    "CN": "Chinese",       # 중국 (중국어 간체)
    "TW": "Chinese (Traditional)", # 대만 (중국어 번체)
    "VN": "Vietnamese",    # 베트남
    "TH": "Thai",          # 태국
    "PH": "Filipino",      # 필리핀어
    "ES": "Spanish",       # 스페인
    "IT": "Italian",       # 이탈리아
    "RU": "Russian",       # 러시아
    "IN": "Hindi",         # 인도 (힌디어)
    "BR": "Portuguese",    # 브라질 (포르투갈어)
    "AR": "Arabic",        # 아랍
    "ID": "Indonesian",    # 인도네시아
    "TR": "Turkish"        # 터키
}

class OnClickTranslator:
    def __init__(self, model_name="gpt-4-turbo"):
        """
        번역 및 검증 모듈.
        """
        self.llm = ChatOpenAI(model=model_name, openai_api_key=openai_api_key)

        # 번역 프롬프트
        self.translate_prompt = PromptTemplate(
            input_variables=["source_language", "target_language", "text"],
            template=(
                "You are a professional translator. Translate the following text "
                "from {source_language} to {target_language} in a natural, conversational tone:\n\n"
                "{text}"
            )
        )

        # 검증 프롬프트
        self.verify_prompt = PromptTemplate(
            input_variables=["source_text", "translated_text"],
            template=(
                "Verify if the translated text is natural and accurately conveys the original meaning:\n\n"
                "Source Text: {source_text}\n"
                "Translated Text: {translated_text}\n\n"
                "Respond with 'Yes' or 'No' and provide a brief explanation."
            )
        )

    @staticmethod
    def get_language_from_country(country_code):
        """
        국가 코드를 기반으로 언어 반환.
        기본값: English
        """
        return COUNTRY_TO_LANGUAGE.get(country_code.upper(), "English")

    def translate(self, source_language, target_language, text):
        """
        번역 기능: 지정된 언어로 텍스트를 번역.
        """
        prompt = self.translate_prompt.format(
            source_language=source_language,
            target_language=target_language,
            text=text
        )

        try:
            response = self.llm.invoke(prompt)
            return response.content.strip()  # content 속성 사용
        except Exception as e:
            raise RuntimeError(f"번역 실패: {e}")

    def verify_translation(self, source_text, translated_text):
        """
        번역 검증: 번역된 텍스트가 원문의 의미와 자연스러움을 검증.
        """
        prompt = self.verify_prompt.format(
            source_text=source_text,
            translated_text=translated_text
        )

        try:
            response = self.llm.invoke(prompt)
            return response.content.strip()  # content 속성 사용
        except Exception as e:
            raise RuntimeError(f"검증 실패: {e}")
