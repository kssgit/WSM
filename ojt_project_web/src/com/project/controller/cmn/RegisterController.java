package com.project.controller.cmn;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.View;

import com.cleopatra.protocol.data.DataRequest;
import com.cleopatra.protocol.data.ParameterGroup;
import com.cleopatra.spring.JSONDataView;
import com.cleopatra.spring.UIView;
import com.project.service.cmn.UserService;

@Controller
@Transactional(rollbackFor = Exception.class)
@RequestMapping("regist")
public class RegisterController {
	
	private final UserService service;
	
	@Autowired
	public RegisterController(UserService service) {
		// TODO Auto-generated constructor stub
		this.service = service;
	}
	
	//회원가입페이지 이동
	@RequestMapping("mvRegist.do")
	public View moveRegistPage(HttpServletRequest req, HttpServletResponse res, DataRequest datareq ) throws Exception{
		
		return new UIView("ui/0_main/register");
	}
	
	
	//회원 가입
	@RequestMapping("/register.do")
	public View register(HttpServletRequest req, HttpServletResponse res, DataRequest datareq ) throws Exception{
		
		ParameterGroup param = datareq.getParameterGroup("dmRegister");
		
		//회원 정보 저장
		int result = service.register(param);
		
		Map<String, String> resMap = new HashMap();
		if(result == 1) {
			resMap.put("MSG", "회원가입에 성공했습니다.");
		}else {
			resMap.put("MSG", "실패 했습니다.");
		}
		
		datareq.setResponse("dmRegisterResult",resMap);
		
		return new JSONDataView();
	}
	
	//아이디 중복 체크 
	@RequestMapping("/idcheck.do")
	public View duplicateID(HttpServletRequest req, HttpServletResponse res, DataRequest datareq ) throws Exception{
		
		ParameterGroup param = datareq.getParameterGroup("dmRegister");
		
		Map<String, Integer> result = service.duplicate(param.getValue("EMAIL"));

		Map<String, String> resMap = new HashMap();
		
		if(result.get("SUCCESS") ==(Integer)1) {//아이디 중복
			resMap.put("MSG", "같은 이메일의 회원이 있습니다.");
			resMap.put("RESULT", "fale");
		}else {
			resMap.put("MSG", "사용 가능한 이메일 입니다.");
			resMap.put("RESULT", "success");
		}
		datareq.setResponse("dmDuplicateResult", resMap);
		return new JSONDataView();
	}
}
