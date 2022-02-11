package com.project.service.interfaces;

import java.util.Map;

import com.cleopatra.protocol.data.ParameterGroup;

public interface UserServiceInterface {

	//로그인 체크
	public Map<String,String> logincheck(String id, String pwd) throws Exception;
	
	//회원 가입
	public int register(ParameterGroup param) throws Exception;

	//ID 중복 체크
	public Map<String, Integer> duplicate(String id) throws Exception;
}
