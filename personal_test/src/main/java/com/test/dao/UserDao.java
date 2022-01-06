package com.test.dao;

import java.util.List;
import java.util.Map;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class UserDao {
	private Logger logger = LogManager.getLogger(UserDao.class);
	
	private final SqlSessionTemplate sqlsession;
	
	@Autowired
	public UserDao(SqlSessionTemplate sqlsession) {
		this.sqlsession = sqlsession;
	}
	
	//select
	public List getSearchEmailList(Map<String , Object> param) {
		return this.sqlsession.selectList("user.searchEmail",param);
	}
	//update
	public int updateUser(Map param) {
		return this.sqlsession.update("user.updateUser",param);
	}
	//insert
	public int insertUser(Map param) {
		return this.sqlsession.insert("user.insertUser",param);
	}
	//delete
	public int deleteUser(Map param) {
		return this.sqlsession.delete("user.deleteUser",param);
	}
}
