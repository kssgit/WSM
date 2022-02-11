package com.project.controller.cmn;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.View;
import org.springframework.web.servlet.view.JstlView;

import com.cleopatra.protocol.data.DataRequest;
import com.cleopatra.protocol.data.ParameterGroup;
import com.cleopatra.spring.JSONDataView;
import com.cleopatra.spring.UIView;
import com.project.service.cmn.UserService;

@Controller
@RequestMapping("main")
public class MainController {
	
	private final UserService service;
	
	@Autowired
	public MainController(UserService service) {
		// TODO Auto-generated constructor stub
		this.service = service;
	}
	
	@RequestMapping("/onload.do")
	public View onLoad(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception{
		ParameterGroup param = dataReq.getParameterGroup("smsOnLoad");
		
		return new UIView();
	}
		
	@RequestMapping("/userinfo.do")
	public View userInfo(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception{
		
		HttpSession userssion = req.getSession(false);
		Map<String, Object> result = new HashMap<String, Object>();
		if(userssion == null) {
			dataReq.setResponse("dmUserinfo", result);
			return new JSONDataView();
		}
		result.put("USER_EMAIL", userssion.getAttribute("USER_EMAIL"));
		result.put("USER_NAME", userssion.getAttribute("USER_NAME"));
		result.put("USER_NUMBER", userssion.getAttribute("USER_NUMBER"));
		System.out.println(userssion.getAttribute("USER_KIND"));
		System.out.println("userinfo :"+userssion.getAttribute("USER_KIND"));
		result.put("USER_KIND", userssion.getAttribute("USER_KIND"));
		
		dataReq.setResponse("dmUserinfo", result);
		
		return new JSONDataView();
	}
	
	@RequestMapping("/myPage.do")
	public View myPage(HttpServletRequest req, HttpServletResponse res, DataRequest datareq ) throws Exception{
			
		return new UIView("ui/0_main/my_page");
	}
	
	@RequestMapping("/getMyInfo.do")
	public View getMyInfo(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception{
		ParameterGroup param = dataReq.getParameterGroup("dmMyInfo");
		String userNum = param.getValue("USER_NUMBER");
		 Map<String, String> result = service.getMyInfo(userNum);
		 dataReq.setResponse("dmGetMyInfo", result);
		
		return new JSONDataView();
	}
	@RequestMapping("/updateMyInfo.do")
	public View updateMyInfo(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception{
		ParameterGroup param = dataReq.getParameterGroup("dmUpdateUserInfo");
		HttpSession userssion = req.getSession(false);
		service.updateUserInfo(param);
		userssion.setAttribute("USER_NAME", param.getValue("USER_NAME"));
		
		return new JSONDataView();
	}
	
	@RequestMapping("/deleteUserInfo.do")
	public View deleteUserInfo(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception{
		ParameterGroup param = dataReq.getParameterGroup("dmMyInfo");
		String userNum = param.getValue("USER_NUMBER");
		service.deleteUserInfo(userNum);
		
		return new JSONDataView();
	}
	
	
}
