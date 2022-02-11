package com.project.service.ptj;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cleopatra.protocol.data.ParameterGroup;
import com.project.dao.ptj.PtjDao;
import com.project.service.interfaces.PartTimeJobServiceInterface;


@Service
public class PtjService implements PartTimeJobServiceInterface {

	private PtjDao dao;
	
	@Autowired
	public PtjService(PtjDao dao) {
		// TODO Auto-generated constructor stub
		this.dao = dao;
	}
	
	@Override
	public List worktimeList(String user_code_ptj) {
		// TODO Auto-generated method stub
		
		return dao.workList(user_code_ptj);
	}

	@Override
	public List dayWorkTimeList(String user_code_ptj, String workDate) {
		// TODO Auto-generated method stub
		
		return dao.dailyworkList(user_code_ptj, workDate);
	}

	@Override
	public List workPlace(int user_number_ptj) {
		// TODO Auto-generated method stub
		return dao.workPlaceList(user_number_ptj);
	}

	public int linkRequst(ParameterGroup param) {
		// TODO Auto-generated method stub
		return dao.linkRequest(param);
	}

	//알바생이 받은 변경 요청 리스트
	public List getScheduleChange(String user_code_ptj) {
		// TODO Auto-generated method stub
		return dao.getScheduleChange(user_code_ptj);
	}

	public void addNewScheduleReq(ParameterGroup param) {
		
		dao.addNewScheduleReq(param);
	}
	
	// 알바생이 요청한 스케줄 리스트
	public List getReqList(String user_code_ptj	, String user_kind) {
		// TODO Auto-generated method stub
		return dao.getRequestSchedule(user_code_ptj,user_kind);
	}

	public List getDaySchedule(String work_date,String user_code_ptj) {
		// TODO Auto-generated method stub
		return dao.getDaySchedule(work_date,user_code_ptj);
	}

	//자신이 요청한 근무 목록 삭제
	public void deleteRequestChange(Map<String, String> map) {
		// TODO Auto-generated method stub
		dao.deleteRequestChange(map);
	}

	public void updateScheduleReq(ParameterGroup param) {
		dao.updateScheduleReq(param);
	}

	public void deleteScheduleReq(ParameterGroup param) {
		// TODO Auto-generated method stub
		dao.deleteScheduleReq(param);
	}

	public List dailyScheduleReq(String user_code_ptj, String format_date) {
		// TODO Auto-generated method stub
		return dao.dailyScheduleReq(user_code_ptj, format_date);
	}

	public void deleteStore(String store_code,String user_code_ptj) {
		// TODO Auto-generated method stub
		dao.deleteStore(store_code,user_code_ptj);
	}

	public void saveAcceptSchedule(Map<String, String> map) {
		// TODO Auto-generated method stub
		dao.saveAcceptSchedule(map);
	}


	
	
	
}
