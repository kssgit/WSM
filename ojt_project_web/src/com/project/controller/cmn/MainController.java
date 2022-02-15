package com.project.controller.cmn;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestHeader;
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
		
	
	/**
	  * @Method Name : SessionCheck
	  * @작성일 : 2022. 2. 14.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : sessionCheck
	  * @param req
	  * @param USER_EMAIL
	  * @return
	  */
	public int SessionCheck(HttpServletRequest req, String USER_EMAIL) {
	
		HttpSession userSession = req.getSession(false);
		if(userSession == null) {
			return 0; // 
		}else {
			if(userSession.getAttribute("USER_EMAIL").equals(USER_EMAIL)) {
				return 1;
			}else {
				return 0;
			}
		}
	}
	
	/**
	  * @Method Name : sessionCheck
	  * @작성일 : 2022. 2. 14.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : session check 
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @param USER_EMAIL
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/sessionCheck.do")
	public View sessionCheck(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest,@RequestHeader(value = "USER_EMAIL") String USER_EMAIL) throws Exception{
		int result =SessionCheck(req, USER_EMAIL);
		Map<String , Integer > data = new HashMap<String, Integer>();
		if(result == 0) {
			data.put("result", result);
			dataRequest.setResponse("dmSessionCheck", data);
		}else {
			data.put("result", result);
			dataRequest.setResponse("dmSessionCheck", data);
		}
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : userInfo
	  * @작성일 : 2022. 2. 14.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : session에 저장된 사용자 정보 조회
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/userinfo.do")
	public View userInfo(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception{
		
		HttpSession userssion = req.getSession(false);
		Map<String, Object> result = new HashMap<String, Object>();
		
		if(userssion == null) {
			dataReq.setResponse("dmUserinfo", result);
			return new JSONDataView();
		}
		result.put("USER_EMAIL", userssion.getAttribute("USER_EMAIL")); // 사용자 ID
		result.put("USER_NAME", userssion.getAttribute("USER_NAME")); // 사용자 이름
		result.put("USER_NUMBER", userssion.getAttribute("USER_NUMBER"));// 사용자 번호(INDEX)
		result.put("USER_KIND", userssion.getAttribute("USER_KIND")); // 사용자 구분
		
		dataReq.setResponse("dmUserinfo", result);
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : myPage
	  * @작성일 : 2022. 2. 14.
	  * @작성자 : KyeongSu
	  * @변경이력 : 
	  * @Method 설명 : mypage 이동 
	  * @param req
	  * @param res
	  * @param datareq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/myPage.do")
	public View myPage(HttpServletRequest req, HttpServletResponse res, DataRequest datareq ) throws Exception{
			
		return new UIView("ui/0_main/my_page");
	}
	
	/**
	  * @Method Name : getMyInfo
	  * @작성일 : 2022. 2. 14.
	  * @작성자 : KyeongSu
	  * @변경이력 : 
	  * @Method 설명 :
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/getMyInfo.do")
	public View getMyInfo(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception{
		ParameterGroup param = dataReq.getParameterGroup("dmMyInfo");
		String userNum = param.getValue("USER_NUMBER");
		Map<String, String> result = service.getMyInfo(userNum);
		dataReq.setResponse("dmGetMyInfo", result); 
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : updateMyInfo
	  * @작성일 : 2022. 2. 14.
	  * @작성자 : KyeongSu
	  * @변경이력 : 
	  * @Method 설명 : 사용자 정보 변경 업데이트
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/updateMyInfo.do")
	public View updateMyInfo(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception{
		ParameterGroup param = dataReq.getParameterGroup("dmUpdateUserInfo");
		HttpSession userssion = req.getSession(false);
		service.updateUserInfo(param);
		userssion.setAttribute("USER_NAME", param.getValue("USER_NAME")); // 변경된 사용자 이름 session에 다시 저장
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : deleteUserInfo
	  * @작성일 : 2022. 2. 14.
	  * @작성자 : KyeongSu
	  * @변경이력 : 
	  * @Method 설명 :
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/deleteUserInfo.do")
	public View deleteUserInfo(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception{
		ParameterGroup param = dataReq.getParameterGroup("dmMyInfo");
		String userNum = param.getValue("USER_NUMBER");
		service.deleteUserInfo(userNum);
		
		return new JSONDataView();
	}
	
	
}
