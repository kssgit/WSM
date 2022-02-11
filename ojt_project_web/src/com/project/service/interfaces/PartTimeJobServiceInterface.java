package com.project.service.interfaces;

import java.util.List;

public interface PartTimeJobServiceInterface {
	
	
	/**
	  * @Method Name : workPlace
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 :
	  * @param user_number_ptj
	  * @return
	  */
	public List workPlace(int user_number_ptj);
	
	/**
	  * @Method Name : worktimeList
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 :
	  * @param user_number
	  * @return
	  */
	public List worktimeList(String user_number);
	
	/**
	  * @Method Name : dayWorkTimeList
	  * @작성일 : 2022. 1. 25.
	  * @작성자 : SeongSoo
	  * @변경이력 : 
	  * @Method 설명 :
	  * @param user_number
	  * @param workDate
	  * @return
	  */
	public List dayWorkTimeList(String user_number, String workDate);
	
	//개인 근무지 수정 서비스 upadetIsolateWorkPlace
	
	//개인 근무지 삭제 서비스 deleteIsolateWorkPlace
	
	//개인 근무지 추가 서비스 addIsolateWorkPlace
	
	//고용주 매장 리스트 조회 서비스 selectBossStore

	//**사업장 연결 서비스 linkeBossStore
	
	//**근무 일정 추가(연결/비연결) 서비스 addWorkSchedule
	
	//변경된 근무 일자 조회 서비스 selectChagedWorkSchedule
	
	//근무 일정 변경(연결/비연결) 서비스 updateWorkSchedule
	
	//근무 일정 변경 수락 서비스 acceptChangedWorkSchedule
}
