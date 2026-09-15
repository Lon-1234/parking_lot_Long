package com.lon.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * <p>
 * 月租申请及有效月租表
 * </p>
 *
 * @author Long
 * @since 2026-09-13
 */
@Getter
@Setter
@TableName("monthly_application")
public class MonthlyApplication implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 月租申请主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 月租申请编号
     */
    private String applicationNo;

    /**
     * 申请用户ID
     */
    private Long userId;

    /**
     * 申请车辆ID
     */
    private Long vehicleId;

    /**
     * 停车场ID
     */
    private Long parkingLotId;

    /**
     * 月租套餐ID
     */
    private Long planId;

    /**
     * 申请金额快照
     */
    private BigDecimal applicationAmount;

    /**
     * 有效开始日期
     */
    private LocalDate startDate;

    /**
     * 有效结束日期
     */
    private LocalDate endDate;

    /**
     * 状态：0待审核，1通过，2拒绝，3取消，4过期
     */
    private Byte status;

    /**
     * 审核管理员ID
     */
    private Long auditUserId;

    /**
     * 审核意见
     */
    private String auditRemark;

    /**
     * 审核时间
     */
    private LocalDateTime auditTime;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
