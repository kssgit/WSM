package com.project.dao.cmn;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.cleopatra.protocol.data.ParameterGroup;


@Repository
public class UserDao {
	
	private final SqlSessionTemplate sqlsession;
	
	@Autowired
	public UserDao(SqlSessionTemplate sqlsession) {
		this.sqlsession = sqlsession;
	}
	
	//ID 중복 체크 
	public Map<String, Integer> duplicateId(String id) {// 고용주
		Map<String, Object> param = new HashMap<String, Object>();
		param.put("email", id);
		return sqlsession.selectOne("user.idExist", param);
	}
	
	//email check
	public Map<String, Object> emailcheck(String id) {
		// TODO Auto-generated method stub
		Map<String, Object> param = new HashMap<String, Object>();
		param.put("email", id);
		
		return sqlsession.selectOne("user.userIdcheck", param);
	}

	public int regist(String id, String pwd, String birthdate, String gender, String call, String name,String userkind) {
		Map<String, Object> param = new HashMap<String, Object>();
		param.put("id", id);
		param.put("pwd", pwd);
		param.put("birthdate", birthdate);
		param.put("gender", gender);
		param.put("call", call);
		param.put("name", name);
		if(userkind.equals("1")) {
			param.put("userkind", true );			
		}else {
			param.put("userkind", false);	
		}
		
		return sqlsession.insert("user.regist", param);
	}
	
	//salt 찾기
	public Map findsalt(Object user_number) {
		// TODO Auto-generated method stub
		return sqlsession.selectOne("user.findsalt", user_number);
	}
	
	//salt 저장
	public int insertSalt(Integer user_number,String salt) {
		// TODO Auto-generated method stub
		Map<String, Object> param = new HashMap<String, Object>();
		param.put("user_number", user_number);
		param.put("salt", salt);
		
		return sqlsession.insert("user.insertSalt", param);
	}

	public Map<String, String> getMyInfo(String userNum) {
		return sqlsession.selectOne("user.getMyInfo", userNum);
	}

	public void updateUserInfo(ParameterGroup param) {
		Map<String, Object> data = new HashMap<String, Object>();
		data.put("USER_NAME", param.getValue("USER_NAME"));
		data.put("USER_CALL", param.getValue("USER_CALL"));
		data.put("USER_GENDER", param.getValue("USER_GENDER"));
		data.put("USER_NUMBER", param.getValue("USER_NUMBER"));
		
		
		sqlsession.update("user.updateUserInfo", data);
	}

	public void deleteUserInfo(String userNum) {
		// TODO Auto-generated method stub
		sqlsession.delete("user.deleteUserInfo",userNum);
	}
	
}
