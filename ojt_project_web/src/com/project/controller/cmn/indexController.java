package com.project.controller.cmn;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.View;

import com.cleopatra.protocol.data.DataRequest;
import com.cleopatra.spring.UIView;



@Controller
public class indexController {
	
	
	/**
	  * @Method Name : index
	  * @작성일 : 2022. 1. 28.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : session 존재 유무에 따른 로그인 페이지 및 메인페이지 이동
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("index.do")
	public View index(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		
		HttpSession session =req.getSession(false); // session 값이 있다면 값 반환 , 없다면 null 반환

		if(session != null && session.getAttribute("USER_NAME") != null) {

			return new UIView("ui/0_main/main_page"); // 메인페이지
		
		}

		return new UIView("ui/0_main/login");// session에 정보가 없다면 로그인 페이지
	}
}
