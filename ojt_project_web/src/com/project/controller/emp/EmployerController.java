package com.project.controller.emp;


import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.View;

import com.cleopatra.protocol.data.DataRequest;
import com.cleopatra.protocol.data.DataResponse;
import com.cleopatra.protocol.data.ParameterGroup;
import com.cleopatra.protocol.data.ParameterRow;
import com.cleopatra.spring.JSONDataView;
import com.project.dao.emp.EmployerDao;
//import com.project.service.emp.EmployerService;

/**
  * @FileName : EmployerController.java
  * @Project : ojt_project_web
  * @Date : 2022. 1. 25. 
  * @작성자 : SeongSoo
  * @변경이력 :
  * @프로그램 설명 : 고용주 Controller
  * 총 16개 함수
  */
@Controller
@RequestMapping("emp")
public class EmployerController {
	
//	private final EmployerService service;
	private final EmployerDao dao;
	/**
	 * 생성자
	 * @param service
	 */
	@Autowired
	public EmployerController(/* EmployerService service, */ EmployerDao dao) {
		// TODO Auto-generated constructor stub
//		this.service = service;
		this.dao = dao;
	}
	
	
	
	
	/**
	  * @Method Name : onLoad
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 고용주 메인 페이지 로드 시 매장 리스트 및 스케줄 정보 조회
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/onLoad.do")
	public View onLoad(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dmOnLoad");
		
		String USER_EMAIL = param.getValue("USER_EMAIL");
		String USER_NUMBER =param.getValue("USER_NUMBER");
		//매장 리스트 
		List storeList = dao.storeList(USER_NUMBER,null,null);
		//매장 스케줄 리스트
		List storeScheduleList = dao.storeScheduleList(USER_EMAIL);

		dataRequest.setResponse("dsStoreList", storeList);
		dataRequest.setResponse("dsEvnt", storeScheduleList);
			
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : storeList
	  * @작성일 : 2022. 1. 27.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 사원이 매장을 연결하기위해 고용주의 아이디로 매장 리스트 조회
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/ptjstoreList.do")
	public View storeList(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{ 
		ParameterGroup param = dataRequest.getParameterGroup("dmEmpInfo");

		List storeList = dao.storeList(null, param.getValue("user_id"),param.getValue("user_code_ptj"));

		dataRequest.setResponse("dsStoreList", storeList);
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : addStore
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 매장 추가
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/addStore.do")
	public View addStore(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dmAddStore");
		
		int result = dao.addStore(param);
		if(result != 1) {
			System.out.println("오류 발생");
		}
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : getPtjList
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : KyeongSu
	  * @변경이력 : 
	  * @Method 설명 : 직원 목록 조회
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/getPtjList.do")
	public View getPtjList(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dmGetPtjList");
		String storeCode = param.getValue("STORE_CODE"); 
		String userNumber = param.getValue("USER_NUMBER");
		List<Map<String, Object>> result = dao.getPtjList(storeCode, userNumber);
		System.out.println(result.toString());
		dataRequest.setResponse("dsPtjList", result);
		
		return new JSONDataView();
	}
	
	
	
	/**
	 * @Method Name : getSchedule
	 * @작성일 : 2022. 1. 25.
	 * @작성자 : KyeongSu
	 * @변경이력 : 
	 * @Method 설명 : 직원별 스케줄 목록 조회
	 * @param req
	 * @param res
	 * @param dataRequest
	 * @return
	 * @throws Exception
	 */
	@RequestMapping("/getSchedule.do")
	public View getSchedule(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dmGetSchedule");
		
		List<Map<String, Object>> result = dao.getschedule(param);
		System.out.println(result.toString());
		dataRequest.setResponse("dsSchedule", result);
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : requestList
	  * @작성일 : 2022. 2. 15.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 매장 연결 요청 목록 조회
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/requestList.do")
	public View requestList(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dmSearch");
		System.out.println(param.toString());
		String USER_NUMBER = param.getValue("USER_NUMBER");
		String STORE_CODE =param.getValue("STORE_CODE");
		String PTJ_NAME = param.getValue("PTJ_NAME");
		
		//매장 리스트 조회
//		List storeList = dao.storeList(USER_NUMBER,null,null);
		//매장 연결 요청 목록 조회
		List requestList = dao.getRequestList(USER_NUMBER,STORE_CODE,PTJ_NAME);
		System.out.println(requestList.toString());
//		dataRequest.setResponse("dsStoreList", storeList);
		dataRequest.setResponse("dsRequest", requestList);
			
		return new JSONDataView();
	}
	
	
	
	/**
	  * @Method Name : acceptPtjRequest
	  * @작성일 : 2022. 2. 3.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 알바생 매장등록 요청 수락 
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/acceptPtjRequest.do")
	public View acceptPtjRequest(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
//		ParameterGroup param = dataRequest.getParameterGroup("dsRequest");
//		
//		if(param != null) {
//			Iterator<ParameterRow> iter;
//			//update
//			iter = param.getUpdatedRows();
//			while(iter.hasNext()) {
//				dao.updatePtLinkjRequest(iter.next().toMap());
//			}
//		}
		
		ParameterGroup param = dataRequest.getParameterGroup("dmUpdate");
		
		System.out.println(param.toString());
		
		dao.updatePtLinkjRequest(param);
		
		
		return new JSONDataView();
	}
	
	
	
	/**
	  * @Method Name : requestPtjSchedule
	  * @작성일 : 2022. 2. 3.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 고용주가 알바생 근무일정 변경 및 추가 
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/requestPtjSchedule.do")
	public View requestPtjSchedule(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dsSchedule");
		
		if(param != null) {
			Iterator<ParameterRow> iter;
			//delete
			iter = param.getDeletedRows();
			while(iter.hasNext()) {
				dao.reqDeleteWork(iter.next().toMap());
			}
			
			iter = param.getInsertedRows();
			//Insert
			while(iter.hasNext()) {
				dao.reqCreateWork(iter.next().toMap());
			}
			
			//update
			iter = param.getUpdatedRows();
			while(iter.hasNext()) {
				dao.reqUpdateWork(iter.next().toMap());
			}
		}
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : scheduleChangeList
	  * @작성일 : 2022. 2. 6.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 스케줄 변경 요청 리스트 (고용주)
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/scheduleChangeList.do")
	public View scheduleChangeListEmp(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dmOnLoad");
		
		List changeList = dao.getscheduleChange(param.getValue("USER_EMAIL"));
		System.out.println(changeList.toString());
		
		dataRequest.setResponse("dsScheduleChange", changeList);

		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : requestScheduleChange
	  * @작성일 : 2022. 2. 8.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 고용주가 요청한 근무 스케줄 목록
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/requestScheduleChange.do")
	public View requestScheduleChangeEmp(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dmOnLoad");
		
		List reqChangeList = dao.getReqList(param.getValue("USER_EMAIL"),param.getValue("USER_KIND"));
		
		dataRequest.setResponse("dsRequest", reqChangeList);
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : selectedChangeSchedul
	  * @작성일 : 2022. 2. 7.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 선택한 요청 근무일자에 해당하는 스케줄 정보 확인
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/selectedChangeSchedul.do")
	public View selectedChangeSchedulEmp(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dmSelectRow");
		
		List daySchedule = dao.getDaySchedule(param.getValue("WORK_DATE"),param.getValue("STORE_CODE"));

		dataRequest.setResponse("dsSelectSchedule", daySchedule);
		
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : saveAcceptSchedule
	  * @작성일 : 2022. 2. 7.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 알바생이 요청한 근무일자에 대한 승인 여부 저장
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/saveAcceptSchedule.do")
	public View saveAcceptScheduleEmp(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dsScheduleChange");
		Map<String, Integer > exception = new HashMap<String, Integer>();
		if(param != null ) {
			Iterator<ParameterRow> iter;
			
			iter = param.getUpdatedRows();
			while(iter.hasNext()) {
				int result = dao.updateAcceptScheduleChange(iter.next().toMap());
				if(result == 1) { // 시간 중복 발생으로 해당 요천 근무는 거절 됨
					exception.put("message", 1);
					dataRequest.setResponse("dmException", exception);
				}
			}
		}
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : updaterequestChange
	  * @작성일 : 2022. 2. 7.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 고용주가 자신이 요청 목록 삭제
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
	  * @Method Name : ptjDelete
	  * @작성일 : 2022. 2. 8.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 직원 퇴사 
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/ptjDelete.do")
	public View ptjDelete(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		
		ParameterGroup param = dataRequest.getParameterGroup("dmPtjDelete");
		
		dao.deletePtj(param.getValue("PTJ_CODE"),param.getValue("USER_CODE_PTJ"));
		
		return new JSONDataView();
	}
	
	
	/**
	  * @Method Name : checkSchedule
	  * @작성일 : 2022. 2. 9.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 :
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/checkSchedule.do")
	public View checkSchedule(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dmCheckUD");

		int result = dao.checkSchedule(param.getValue("SCHEDULE_CODE"));
//		System.out.println("변경 가능 여부 : "+result);
		Map<String, Integer> dm = new HashMap<String, Integer>();
		dm.put("RESULT", result);
		dataRequest.setResponse("dmCheckUD", dm);
		return new JSONDataView();
	}
	
	/**
	  * @Method Name : deleteStore
	  * @작성일 : 2022. 2. 9.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 매장 삭제
	  * @param req
	  * @param res
	  * @param dataRequest
	  * @return
	  * @throws Exception
	  */
	@RequestMapping("/deleteStore.do")
	public View deleteStore(HttpServletRequest req , HttpServletResponse res, DataRequest dataRequest) throws Exception{
		ParameterGroup param = dataRequest.getParameterGroup("dmDeleteStore");
//		System.out.println(param);
		dao.deleteStore(param.getValue("STORE_CODE"), param.getValue("USER_NUMBER"));
		
		
		return new JSONDataView();
	}
		
	
}
