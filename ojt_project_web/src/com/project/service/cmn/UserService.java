package com.project.service.cmn;

import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cleopatra.protocol.data.ParameterGroup;
import com.project.dao.cmn.UserDao;
import com.project.service.interfaces.UserServiceInterface;

@Service
public class UserService implements UserServiceInterface{
	
	private final UserDao userdao;
	
	@Autowired
	public UserService(UserDao userdao) {
		// TODO Auto-generated constructor stub
		this.userdao = userdao;
	}
	
	//로그인 체크
	@Override
	public Map logincheck(String id, String pwd) throws Exception {
		Map<String, Object> data = null;
		
		//id 조회 
		data = userdao.emailcheck(id);
		
		//일치하는 ID가 없음 ------------------------------
		if(data == null) {
			data = new HashMap<String, Object>();
			data.put("check", "0");
			return data;
		}
		
		//일치하는 사용자ID의 사용자 번호로 salt 검색
		Map salt = userdao.findsalt(data.get("USER_NUMBER"));

		//찾은 salt값으로 pwd 값 비교
		
		String realPwd =(String)data.get("PASSWORD");
		
		//조회한 salt값으로 들어온 비밀번호 암호화	
		String hex = securitypwd((String)salt.get("SALT"), pwd);
						
		//현제 들어온 비밀번호 암호화와 DB에 저장된 비밀번호 암호화 비교 ------------
		if(!realPwd.equals(hex)) {// 같지 않으면 2
			data.clear();
			data.put("check", "2");
			return data;
		}
		
		data.put("check", "1");
		data.remove("salt");
		
		return data;//id, 비밀번호 다 같으면 1
	}
	
	//회원 가입
	@Override
	public int register(ParameterGroup param) throws Exception {
		// TODO Auto-generated method stub
		//비밀번호 암호화
		SecureRandom random = SecureRandom.getInstance("SHA1PRNG");
		byte[] bytes = new byte[16];
		random.nextBytes(bytes);
		String salt = new String(Base64.getEncoder().encode(bytes));
		String pwd = securitypwd(salt, param.getValue("PASSWORD"));
		//insert
		int result = userdao.regist(param.getValue("EMAIL"), pwd, param.getValue("BIRTHDATE"), 
				param.getValue("GENDER"), param.getValue("CALL"), param.getValue("NAME"),param.getValue("USERKIND"));
		if(result != 1) {
			return result;
		}
		//사용자 정보를 통해 salt 테이블에 SALT 추가 
		Map<String, Object> data = userdao.emailcheck(param.getValue("EMAIL"));
		System.out.println(data.get("USER_NUMBER"));
		return userdao.insertSalt((Integer)data.get("USER_NUMBER"), salt);
	}
	
	//ID 중복 체크
	@Override
	public Map<String, Integer> duplicate(String id) throws Exception {
		// TODO Auto-generated method stub
		return userdao.duplicateId(id);
		
	}
	
	//암호화 메서드(해시 SHA-256)
	private String securitypwd(String salt,String pwd) throws Exception {
		
		MessageDigest md = MessageDigest.getInstance("SHA-256");
		md.update(salt.getBytes());
		md.update(pwd.getBytes());
		String hex = String.format("%064x", new BigInteger(1, md.digest()));
		
		return hex;
	}

	public Map<String, String> getMyInfo(String userNum) {
		
		return userdao.getMyInfo(userNum);
	}

	public void updateUserInfo(ParameterGroup param) {
		// TODO Auto-generated method stub
		userdao.updateUserInfo(param);
	}

	public void deleteUserInfo(String userNum) {
		// TODO Auto-generated method stub
		userdao.deleteUserInfo(userNum);
		
	}


	
	
}
