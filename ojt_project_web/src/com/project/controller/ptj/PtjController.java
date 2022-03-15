package com.project.controller.ptj;

import java.util.Iterator;
import java.util.List;


import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.servlet.View;

import com.cleopatra.protocol.data.DataRequest;
import com.cleopatra.protocol.data.ParameterGroup;
import com.cleopatra.protocol.data.ParameterRow;
import com.cleopatra.spring.JSONDataView;
import com.project.dao.ptj.PtjDao;


/**
  * @FileName : PtjController.java
  * @Project : ojt_project_web
  * @Date : 2022. 1. 25. 
  * @작성자 : SeongSoo
  * @변경이력 :
  * @프로그램 설명 : 알바생 컨트롤러
  *  총 14 개 함수 
  */
@Controller
@RequestMapping("ptj")
public class PtjController {

	private final PtjDao dao;
	
	/**
	 * 생성자
	 * @param serivce
	 */
	@Autowired
	public PtjController(PtjDao dao) {

		this.dao = dao;
	}
	
	
	/**
	  * @Method Name : onload
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 알바생 메인페이지 생성시 실행
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/onLoad.do")
	public View onload(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		ParameterGroup param = dataReq.getParameterGroup("dmOnLoad");
		if(param != null) {
			List workList = dao.workList(param.getValue("user_code_ptj"));

			dataReq.setResponse("dsEvnt", workList);
		}
			
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : dailySchedule
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 알바생 근무 스케줄 조회
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/dailySchedule.do")
	public View dailySchedule(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		ParameterGroup param = dataReq.getParameterGroup("dmDailySchedule");
		if(param != null) {
			String work_date = param.getValue("work_date");
			String format_date = work_date.substring(0, 4) + "-" + work_date.substring(4,6) + "-" + work_date.substring(6);
			
			List workList = dao.dailyworkList(param.getValue("user_code_ptj"),format_date);
			
			dataReq.setResponse("dsDailySchedule", workList);
		}
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : dailyScheduleReq
	  * @작성일 : 2022. 2. 08.
	  * @작성자 : KyeongSu
	  * @변경이력 : 
	  * @Method 설명 : 현재 요청중인 근무 목록 조회
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/dailyScheduleReq.do")
	public View dailyScheduleReq(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		ParameterGroup param = dataReq.getParameterGroup("dmDailySchedule");
		if(param != null) {
			String user_code_ptj = param.getValue("user_code_ptj");
			String work_date = param.getValue("work_date");
			String format_date = work_date.substring(0, 4) + "-" + work_date.substring(4,6) + "-" + work_date.substring(6);
			
			List workList = dao.dailyScheduleReq(user_code_ptj,format_date);
			
			dataReq.setResponse("dsDailyScheduleReq", workList);
		}
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : workPlace
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 근무지리스트 조회
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/workplace.do")
	public View workPlace(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		ParameterGroup param = dataReq.getParameterGroup("dmUserInfo");
		if(param != null) {
			List workPlaceList = dao.workPlaceList(Integer.parseInt(param.getValue("user_code_ptj")));

			dataReq.setResponse("dsWpName", workPlaceList);
		}
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : linkRequest
	  * @작성일 : 2022. 1. 27.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 매장 연결 요청
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/storeLinkRequest.do")
	public View linkRequest(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		
		ParameterGroup param = dataReq.getParameterGroup("dmRequseLink");
		
		if(param != null) {
			dao.linkRequest(param);
		}		
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : scheduleChangeList
	  * @작성일 : 2022. 2. 6.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 스케줄 변경 요청 목록 조회(알바생)
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/scheduleChangeList.do")
	public View scheduleChangeList(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		
		ParameterGroup param = dataReq.getParameterGroup("dmOnLoad");
		if(param != null ) {
			List changelist = dao.getScheduleChange(param.getValue("USER_NUMBER"));
			
			dataReq.setResponse("dsScheduleChange", changelist);
		}

		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : addNewScheduleReq
	  * @작성일 : 2022. 2. 8.
	  * @작성자 : KyeongSu
	  * @변경이력 : 
	  * @Method 설명 : 신규 스케줄 등록 요청
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/addNewScheduleReq.do")
	public View addNewScheduleReq(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		ParameterGroup param = dataReq.getParameterGroup("dmNewSchedule");
		if(param != null) {			
			dao.addNewScheduleReq(param);
		}
		
		return new JSONDataView();
	}
	
	
	
	/**
	  * @Method Name : requestScheduleChange
	  * @작성일 : 2022. 2. 8.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 알바생이 요청한 근무 스케줄 목록
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/requestScheduleChange.do")
	public View requestScheduleChange(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dmOnLoad");
		if(param != null) {
			
			List reqChangeList = dao.getRequestSchedule(param.getValue("USER_NUMBER"),param.getValue("USER_KIND"));
			
			dataRequest.setResponse("dsRequest", reqChangeList);
		}
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : selectedChangeSchedulEmp
	  * @작성일 : 2022. 2. 8.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 선택한 근무일자에 해당하는 스케줄 리스트
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/selectedChangeSchedul.do")
	public View selectedChangeSchedulEmp(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dmSelectRow");
		
		if(param != null ) {
			List daySchedule = dao.getDaySchedule(param.getValue("WORK_DATE"),param.getValue("USER_NUMBER"));
			
			dataRequest.setResponse("dsSelectSchedule", daySchedule);
		}
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : updaterequestChangeEmp
	  * @작성일 : 2022. 2. 8.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 요청한 목록 삭제 
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/updaterequestChange.do")
	public View updaterequestChangeEmp(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dsRequest");
		
		if(param != null) {
			Iterator<ParameterRow> iter;
			
			iter = param.getDeletedRows();
			while(iter.hasNext()) {
				dao.deleteRequestChange(iter.next().toMap());
			}
		}
		
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : updateScheduleReq
	  * @작성일 : 2022. 2. 8.
	  * @작성자 : KyeongSu
	  * @변경이력 : 
	  * @Method 설명 : 스케줄 변경 요청 (알바생)
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/updateScheduleReq.do")
	public View updateScheduleReq(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		ParameterGroup param = dataReq.getParameterGroup("dmUpdateSchedule");
		
		if(param != null) {
			dao.updateScheduleReq(param);
		}
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : deleteScheduleReq
	  * @작성일 : 2022. 2. 9.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 요청한 근무 스케줄 삭제
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/deleteScheduleReq.do")
	public View deleteScheduleReq(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		ParameterGroup param = dataReq.getParameterGroup("dmUpdateSchedule");
		
		if(param != null) {			
			dao.deleteScheduleReq(param);
		}
		
		return new JSONDataView();
	}
	
	
	
	/**
	  * @Method Name : deleteStore
	  * @작성일 : 2022. 2. 9.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 근무지 삭제
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/deleteStore.do")
	public View deleteStore(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		
		ParameterGroup param = dataReq.getParameterGroup("dmDeleteStore");
		
		if(param != null) {
			dao.deleteStore(param.getValue("STORE_CODE"),param.getValue("USER_NUMBER"));
		}	
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : saveAcceptSchedule
	  * @작성일 : 2022. 2. 15.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 요청 근무 수락 및 거절
	  * @param req
	  * @param res
	  * @param dataReq
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/saveAcceptSchedule.do")
	public View saveAcceptSchedule(HttpServletRequest req, HttpServletResponse res, DataRequest dataReq) throws Exception {
		ParameterGroup param = dataReq.getParameterGroup("dsScheduleChange");
		
		if(param != null) {
			Iterator<ParameterRow> iter;
			
			iter = param.getUpdatedRows();
			while(iter.hasNext()) {
				dao.saveAcceptSchedule(iter.next().toMap());
			}
		}
		
		
		return new JSONDataView();
	}
}
