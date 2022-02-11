package com.project.service.interfaces;

import java.util.List;
import java.util.Map;

public interface EmployerServiceInterface {
	
	
	/**
	  * @Method Name : storeList
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 사용자가 등록한 매장리스트 조회
	  * @param user_number
	  * @return
	  */
	public List storeList(String user_number, String user_email, String user_code_ptj);
	

	/**
	  * @Method Name : storeScheduleList
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 :사용자가 등록한 매장의 일정정보 조회
	  * @param user_id
	  * @return
	  */
	public List storeScheduleList(String user_id);
	
	/**
	  * @Method Name : addStore
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 : 고용주 매장 추가
	  * @param storeData
	  * @return
	  */
	public int addStore(Map<String, Object> storeData);
	
	//사원 정보(일정) 조회 서비스 selectPtjOfStore
	
	//사원 일정 변경 서비스 updateChangePtjSchedule
	
	//사원 매장 연결 요청 리스트 조회 서비스 selectReqPtjLink
	
	//사원 매장 연결 요청 승인 서비스 acceptPtjLink
	
	//사원 일정 변경 수락 서비스 acceptPtjChageSchedule
	
}
