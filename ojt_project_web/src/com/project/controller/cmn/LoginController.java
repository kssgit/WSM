package com.project.controller.cmn;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.logging.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.View;

import com.cleopatra.protocol.data.DataRequest;
import com.cleopatra.protocol.data.ParameterGroup;
import com.cleopatra.spring.JSONDataView;
import com.cleopatra.spring.UIView;
import com.project.service.cmn.UserService;
import com.sun.istack.internal.logging.Logger;

@Controller
@RequestMapping("user")
public class LoginController {
	

	private final UserService loginservice;
	
	@Autowired
	public LoginController(UserService loginservice) {
		// TODO Auto-generated constructor stub
		this.loginservice = loginservice;
	}
	
	/**
	  * @Method Name : logincheck
	  * @작성일 : 2022. 1. 28.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 로그인 체크
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/login.do")
	public View logincheck(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception{
		
		ParameterGroup param = dataReq.getParameterGroup("dmLogin");
		// session이 존재하면 session객체 리턴, 없으면 null을 리턴
		HttpSession session = req.getSession(false);
		//로그인 check
		Map data =loginservice.logincheck(param.getValue("EMAIL"), param.getValue("PASSWORD"));
		
		Map<String , String> map = new HashMap<String, String>();

		if(data.get("check").equals("1")) {// 로그인 성공
			//session이 존재하면 session객체 리턴, 없으면 새로 생성해서 리턴
			session = req.getSession(true);
//			System.out.println("로그인 성공 " +data.get("USER_KIND"));
			//세션에 사용자 정보 담기 
			if(!(boolean) data.get("USER_KIND")) {
				session.setAttribute("USER_KIND","PARTTIMEJOB");
			}else {
				session.setAttribute("USER_KIND", "EMPLOYER");
			}
			session.setAttribute("USER_EMAIL", param.getValue("EMAIL"));
			session.setAttribute("USER_NAME", data.get("NAME"));
			session.setAttribute("USER_NUMBER", data.get("USER_NUMBER"));
			
			map.put("MSG", null);
			map.put("FOCUS", null);
			dataReq.setResponse("dmLoginCheck", map);

		}else if(data.get("check").equals("2")) {// 비밀번호가 잘못됬을 경우
			String msg = "비밀번호가 맞지 않습니다. 다시 입력해주세요.";
			map.put("MSG", msg);
			map.put("FOCUS", "ipbpwd");
			dataReq.setResponse("dmLoginCheck", map);
		}else {// 아이디가 존재하지 않을 경우
			String msg = "아이디가 존재하지 않습니다.";
			map.put("MSG", msg);
			map.put("FOCUS", "ipbId");
			dataReq.setResponse("dmLoginCheck", map);
		}
		
		
		return new JSONDataView();
	}
	
}
