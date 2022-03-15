package com.project.service.interfaces;

import java.util.Map;

import com.cleopatra.protocol.data.ParameterGroup;

public interface UserServiceInterface {

	//로그인 체크
	Map<String,String> logincheck(String id, String pwd) throws Exception;
	
	//회원 가입
	int register(ParameterGroup param) throws Exception;

	//ID 중복 체크
	Map<String, Integer> duplicate(String id) throws Exception;
	
	//사용자 정보 조회
	Map<String, String> getMyInfo(String userNum);
	
	//사용자 정보 업데이트
	void updateUserInfo(ParameterGroup param);
	
	//회원 탈퇴
	void deleteUserInfo(String userNum);
}
