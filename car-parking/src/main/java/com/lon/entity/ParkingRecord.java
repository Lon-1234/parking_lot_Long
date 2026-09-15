package com.lon.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * <p>
 * 停车记录表（含支付与人工放行信息）
 * </p>
 *
 * @author Long
 * @since 2026-09-13
 */
@Getter
@Setter
@TableName("parking_record")
public class ParkingRecord implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 停车记录主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 停车记录编号
     */
    private String recordNo;

    /**
     * 用户ID，临时未绑定车辆可为空
     */
    private Long userId;

    /**
     * 用户车辆ID，未绑定车辆可为空
     */
    private Long vehicleId;

    /**
     * 入场车牌快照
     */
    private String plateNumber;

    /**
     * 停车场ID
     */
    private Long parkingLotId;

    /**
     * 车位ID
     */
    private Long spaceId;

    /**
     * 入场时间
     */
    private LocalDateTime entryTime;

    /**
     * 出场时间
     */
    private LocalDateTime exitTime;

    /**
     * 停车分钟数
     */
    private Integer parkingMinutes;

    /**
     * 应付金额
     */
    private BigDecimal payableAmount;

    /**
     * 支付状态：0未支付，1已支付，2无需支付
     */
    private Byte paymentStatus;

    /**
     * 模拟支付流水号
     */
    private String paymentNo;

    /**
     * 模拟支付时间
     */
    private LocalDateTime payTime;

    /**
     * 记录状态：0停车中，1待缴费，2已缴费，3已出场，4人工放行
     */
    private Byte recordStatus;

    /**
     * 入场时是否有效月租：0否，1是
     */
    private Byte monthlyVehicle;

    /**
     * 人工放行原因
     */
    private String releaseReason;

    /**
     * 最后操作工作人员ID
     */
    private Long operatorId;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
